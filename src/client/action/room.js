/* eslint-disable prefer-const */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable default-param-last */
/* eslint-disable no-restricted-globals */
/* eslint-disable camelcase */
/* eslint-disable no-console */
import { ethers, utils } from 'ethers';
import {
  Interface,
  parseEther
} from 'ethers/lib/utils';
import initMatrix from '../initMatrix';
import appDispatcher from '../dispatcher';
import cons from '../state/cons';
import { getIdServer } from '../../util/matrixUtil';
import generateRandomString from '../../util/randomString';

const provider = new ethers.providers.WebSocketProvider('wss://eth-sepolia.g.alchemy.com/v2/eOLovQ082DFsqRNNckle5rVXwV7PeiyO')
const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spaceOwner", "type": "address" },
      { "internalType": "string", "name": "roomId", "type": "string" }
    ],
    "name": "getRoomSubscriptionFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spaceOwner", "type": "address" },
      { "internalType": "string", "name": "_roomId", "type": "string" }
    ],
    "name": "addOrExtendSubscription",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spaceOwner", "type": "address" },
      { "internalType": "string", "name": "roomId", "type": "string" },
      { "internalType": "address", "name": "subscriber", "type": "address" }
    ],
    "name": "isSubscriptionActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_roomId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_subscriptionFee",
        "type": "uint256"
      }
    ],
    "name": "addRoomToSpace",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];
const contract = new ethers.Contract(contractAddress, ABI, provider);

/**
 * https://github.com/matrix-org/matrix-react-sdk/blob/1e6c6e9d800890c732d60429449bc280de01a647/src/Rooms.js#L73
 * @param {string} roomId Id of room to add
 * @param {string} userId User id to which dm || undefined to remove
 * @returns {Promise} A promise
 */
function addRoomToMDirect(roomId, userId) {
  const mx = initMatrix.matrixClient;
  const mDirectsEvent = mx.getAccountData('m.direct');
  let userIdToRoomIds = {};

  if (typeof mDirectsEvent !== 'undefined') userIdToRoomIds = mDirectsEvent.getContent();

  // remove it from the lists of any others users
  // (it can only be a DM room for one person)
  Object.keys(userIdToRoomIds).forEach((thisUserId) => {
    const roomIds = userIdToRoomIds[thisUserId];

    if (thisUserId !== userId) {
      const indexOfRoomId = roomIds.indexOf(roomId);
      if (indexOfRoomId > -1) {
        roomIds.splice(indexOfRoomId, 1);
      }
    }
  });

  // now add it, if it's not already there
  if (userId) {
    const roomIds = userIdToRoomIds[userId] || [];
    if (roomIds.indexOf(roomId) === -1) {
      roomIds.push(roomId);
    }
    userIdToRoomIds[userId] = roomIds;
  }

  return mx.setAccountData('m.direct', userIdToRoomIds);
}

/**
 * Given a room, estimate which of its members is likely to
 * be the target if the room were a DM room and return that user.
 * https://github.com/matrix-org/matrix-react-sdk/blob/1e6c6e9d800890c732d60429449bc280de01a647/src/Rooms.js#L117
 *
 * @param {Object} room Target room
 * @param {string} myUserId User ID of the current user
 * @returns {string} User ID of the user that the room is probably a DM with
 */
function guessDMRoomTargetId(room, myUserId) {
  let oldestMemberTs;
  let oldestMember;

  // Pick the joined user who's been here longest (and isn't us),
  room.getJoinedMembers().forEach((member) => {
    if (member.userId === myUserId) return;

    if (typeof oldestMemberTs === 'undefined' || (member.events.member && member.events.member.getTs() < oldestMemberTs)) {
      oldestMember = member;
      oldestMemberTs = member.events.member.getTs();
    }
  });
  if (oldestMember) return oldestMember.userId;

  // if there are no joined members other than us, use the oldest member
  room.currentState.getMembers().forEach((member) => {
    if (member.userId === myUserId) return;

    if (typeof oldestMemberTs === 'undefined' || (member.events.member && member.events.member.getTs() < oldestMemberTs)) {
      oldestMember = member;
      oldestMemberTs = member.events.member.getTs();
    }
  });

  if (typeof oldestMember === 'undefined') return myUserId;
  return oldestMember.userId;
}

function convertToDm(roomId) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  return addRoomToMDirect(roomId, guessDMRoomTargetId(room, mx.getUserId()));
}

function convertToRoom(roomId) {
  return addRoomToMDirect(roomId, undefined);
}


/**
 * Checks the status of a transaction based on its hash.
 * @param {string} txHash The hash of the transaction to check.
 * @returns {Promise<boolean>} Returns true if the transaction was successful, false otherwise.
 */

async function checkTransactionStatus(txHash) {
  return new Promise((resolve, reject) => {
    const filters = [{
      filter: {
        address: contractAddress,
        topics: [utils.id("RoomCreated(address,string,uint256)")]
      }
    }, {
      filter: {
        address: contractAddress,
        topics: [utils.id("SubscriberAddedOrExtended(address,string,address,uint256)")]
      }
    },
    {
      filter: {
        address: contractAddress,
        topics: [utils.id("SpaceCreated(address)")]
      }
    }];

    // Single event handler for all events
    const eventHandler = (log) => {
      if (txHash === log.transactionHash) {
        console.log(log);
        filters.forEach(f => provider.off(f.filter, eventHandler));
        resolve(true);
      }
    };

    filters.forEach(f => provider.on(f.filter, eventHandler));

    setTimeout(() => {
      filters.forEach(f => provider.off(f.filter, eventHandler));
      reject(new Error('Transaction status check timed out'));
    }, 60000);  // Timeout after 60 seconds
  });
}

async function joinRoomByContract(roomId, room, smartAccount) {

  const creator = room.getCreator().substring(1, room.getCreator().indexOf(':'));
  const address = await smartAccount.getAddress();

  if (creator.toLowerCase() === address.toLowerCase()) {
    return null;
  }

  try {
    const isSubscribed = await contract.callStatic.isSubscriptionActive(creator, roomId, address);

    if (isSubscribed) return true;

    const fee = await contract.callStatic.getRoomSubscriptionFee(creator, roomId);
    const data = new ethers.utils.Interface(ABI).encodeFunctionData('addOrExtendSubscription', [creator, roomId]);

    const tx = {
      to: contractAddress,
      data,
      value: ethers.utils.parseUnits(fee.toString(), 'wei')
    };

    const feeQuotesResult = await smartAccount.getFeeQuotes(tx);
    const txHash = await smartAccount.sendUserOperation(feeQuotesResult.verifyingPaymasterNative);

    const result = await checkTransactionStatus(txHash)
      .then(receipt => receipt)

    return result
  } catch (error) {
    console.log(error)
    throw new Error(`Error joining room please check your Balance`);
  }
}

/**
 *
 * @param {string} roomId
 * @param {boolean} isDM
 * @param {string[]} via
 */
async function join({ roomIdOrAlias, smartAccount, room, isSpace = false, isDM = false, via = undefined }) {
  const mx = initMatrix.matrixClient;
  const viaServers = via || [roomIdOrAlias.split(':')[1]];

  try {
    const resultContract = !isSpace && await joinRoomByContract(roomIdOrAlias, room, smartAccount);

    if (!isSpace && !resultContract) return false;

    const resultRoom = await mx.joinRoom(roomIdOrAlias, { viaServers });

    if (isDM) {
      const targetUserId = guessDMRoomTargetId(mx.getRoom(resultRoom.roomId), mx.getUserId());
      await addRoomToMDirect(resultRoom.roomId, targetUserId);
    }

    appDispatcher.dispatch({
      type: cons.actions.room.JOIN,
      roomId: resultRoom.roomId,
      isDM
    });

    return resultRoom.roomId;

  } catch (error) {
    alert(error)
    return false;
  }
}

/**
 *
 * @param {string} roomId
 * @param {boolean} isDM
 */
async function leave(roomId) {
  const mx = initMatrix.matrixClient;
  const isDM = initMatrix.roomList.directs.has(roomId);
  try {
    await mx.leave(roomId);
    appDispatcher.dispatch({
      type: cons.actions.room.LEAVE,
      roomId,
      isDM,
    });
  } catch {
    console.error('Unable to leave room.');
  }
}

async function create(options, isDM = false) {
  const mx = initMatrix.matrixClient;
  try {
    const result = await mx.createRoom(options);
    if (isDM && typeof options.invite?.[0] === 'string') {
      await addRoomToMDirect(result.room_id, options.invite[0]);
    }
    // appDispatcher.dispatch({
    //   type: cons.actions.room.CREATE,
    //   roomId: result.room_id,
    //   isDM,
    // });
    return result;
  } catch (e) {
    const errcodes = ['M_UNKNOWN', 'M_BAD_JSON', 'M_ROOM_IN_USE', 'M_INVALID_ROOM_STATE', 'M_UNSUPPORTED_ROOM_VERSION'];
    if (errcodes.includes(e.errcode)) {
      throw new Error(e);
    }
    throw new Error('Something went wrong!');
  }
}

async function createDM(userIdOrIds, isEncrypted = true) {
  const options = {
    is_direct: true,
    invite: Array.isArray(userIdOrIds) ? userIdOrIds : [userIdOrIds],
    visibility: 'private',
    preset: 'trusted_private_chat',
    initial_state: [],
  };
  if (isEncrypted) {
    options.initial_state.push({
      type: 'm.room.encryption',
      state_key: '',
      content: {
        algorithm: 'm.megolm.v1.aes-sha2',
      },
    });
  }

  const result = await create(options, true);
  return result;
}

async function CreateSpaceByContract(smartAccount) {

  const creating = async () => {
    const ABICreate = [{
      "inputs": [],
      "name": "createSpace",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }];

    const callData = new Interface(ABICreate).encodeFunctionData('createSpace', []);

    const tx = {
      to: contractAddress,
      data: callData,
    }

    try {
      const feeQuotesResult = await smartAccount.getFeeQuotes(tx);
      const txHash = await smartAccount.sendUserOperation(feeQuotesResult.verifyingPaymasterNative);
      const result = await checkTransactionStatus(txHash).then(recipe => recipe)
      return result
    }

    catch (e) {
      throw new Error(e?.data.extraMessage.message.match(/"(.*?)"/)[1] || e?.message || e)
    }
  }

  await creating();

  return true;
}

async function CreateRoomByContract(room_id, fee, smartAccount) {
  try {
    if (isNaN(fee)) {
      throw new Error("Fee must be a number");
    }

    const value = parseEther(fee);


    const callData = new Interface(ABI).encodeFunctionData('addRoomToSpace', [room_id, value]);

    const tx = {
      to: contractAddress,
      data: callData,
    }

    const feeQuotesResult = await smartAccount.getFeeQuotes(tx);
    const txHash = await smartAccount.sendUserOperation(feeQuotesResult.verifyingPaymasterNative);
    const result = await checkTransactionStatus(txHash).then(recipe => recipe)
    return result
  }

  catch (e) {
    const errlog = e?.data?.extraMessage?.message || null;
    if (errlog?.match(/"(.*?)"/)?.[1] === "Room ID already exists") {
      return true
    }

    if (errlog === "Simulate user operation failed: AA21 didn't pay prefund") {
      throw new Error("Don't have enough fund in your account")
    }

    throw new Error(errlog?.match(/"(.*?)"/)?.[1] || errlog || e?.message || e)
  }
}

async function createRoom(opts) {
  // joinRule: 'public' | 'invite' | 'restricted'
  const { name, topic, joinRule, fee, smartAccount } = opts;
  const alias = opts.alias ?? undefined;
  const parentId = opts.parentId ?? undefined;
  const isSpace = opts.isSpace ?? false;
  const isEncrypted = opts.isEncrypted ?? false;
  const powerLevel = opts.powerLevel ?? undefined;
  const blockFederation = opts.blockFederation ?? false;
  const mx = initMatrix.matrixClient;
  const visibility = joinRule === 'public' ? 'public' : 'private';
  const room_id = `${generateRandomString(18)}`;

  const options = {
    room_id,
    creation_content: undefined,
    name,
    topic,
    visibility,
    room_alias_name: alias,
    initial_state: [],
    power_level_content_override: undefined,
  };
  if (isSpace) {
    options.creation_content = { type: 'm.space' };
  }
  if (blockFederation) {
    options.creation_content = { 'm.federate': false };
  }
  if (isEncrypted) {
    options.initial_state.push({
      type: 'm.room.encryption',
      state_key: '',
      content: {
        algorithm: 'm.megolm.v1.aes-sha2',
      },
    });
  }
  if (powerLevel) {
    options.power_level_content_override = {
      users: {
        [mx.getUserId()]: powerLevel,
      },
    };
  }
  if (parentId) {
    options.initial_state.push({
      type: 'm.space.parent',
      state_key: parentId,
      content: {
        canonical: true,
        via: [getIdServer(mx.getUserId())],
      },
    });
  }
  if (parentId && joinRule === 'restricted') {
    const caps = await mx.getCapabilities();
    if (caps['m.room_versions'].available?.['9'] !== 'stable') {
      throw new Error("ERROR: The server doesn't support restricted rooms");
    }
    if (Number(caps['m.room_versions'].default) < 9) {
      options.room_version = '9';
    }
    options.initial_state.push({
      type: 'm.room.join_rules',
      content: {
        join_rule: 'restricted',
        allow: [{
          type: 'm.room_membership',
          room_id: parentId,
        }],
      },
    });
  }

  const resultContract = isSpace && await CreateSpaceByContract(smartAccount) || !isSpace && await CreateRoomByContract(`!${room_id}:${getIdServer(mx.getUserId())}`, fee, smartAccount);

  if (!resultContract) {
    return null;
  }

  const result = await create(options);

  if (parentId) {
    await mx.sendStateEvent(parentId, 'm.space.child', {
      auto_join: true,
      suggested: false,
      via: [getIdServer(mx.getUserId())],
    }, result.room_id);
  }

  return result;
}

async function invite(roomId, userId, reason) {
  const mx = initMatrix.matrixClient;
  const parentId = initMatrix.roomList.roomIdToParents.get(roomId).keys().next().value
  const result = await mx.invite(parentId, userId, undefined, reason);
  return result;
}

async function kick(roomId, userId, reason) {
  const mx = initMatrix.matrixClient;

  const result = await mx.kick(roomId, userId, reason);
  return result;
}

async function ban(roomId, userId, reason) {
  const mx = initMatrix.matrixClient;

  const result = await mx.ban(roomId, userId, reason);
  return result;
}

async function unban(roomId, userId) {
  const mx = initMatrix.matrixClient;

  const result = await mx.unban(roomId, userId);
  return result;
}

async function ignore(userIds) {
  const mx = initMatrix.matrixClient;

  let ignoredUsers = mx.getIgnoredUsers().concat(userIds);
  ignoredUsers = [...new Set(ignoredUsers)];
  await mx.setIgnoredUsers(ignoredUsers);
}

async function unignore(userIds) {
  const mx = initMatrix.matrixClient;

  const ignoredUsers = mx.getIgnoredUsers();
  await mx.setIgnoredUsers(ignoredUsers.filter((id) => !userIds.includes(id)));
}

async function setPowerLevel(roomId, userId, powerLevel) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const powerlevelEvent = room.currentState.getStateEvents('m.room.power_levels')[0];

  const result = await mx.setPowerLevel(roomId, userId, powerLevel, powerlevelEvent);
  return result;
}

async function setMyRoomNick(roomId, nick) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const mEvent = room.currentState.getStateEvents('m.room.member', mx.getUserId());
  const content = mEvent?.getContent();
  if (!content) return;
  await mx.sendStateEvent(roomId, 'm.room.member', {
    ...content,
    displayname: nick,
  }, mx.getUserId());
}

async function setMyRoomAvatar(roomId, mxc) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const mEvent = room.currentState.getStateEvents('m.room.member', mx.getUserId());
  const content = mEvent?.getContent();
  if (!content) return;
  await mx.sendStateEvent(roomId, 'm.room.member', {
    ...content,
    avatar_url: mxc,
  }, mx.getUserId());
}

export {
  convertToDm,
  convertToRoom,
  join, leave,
  createDM, createRoom,
  invite, kick, ban, unban,
  ignore, unignore,
  setPowerLevel,
  setMyRoomNick, setMyRoomAvatar,
};
