/* eslint-disable react/button-has-type */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './CreateRoom.scss';

import { useAtom } from 'jotai';
import { useSnackbar } from 'notistack';
import { twemojify } from '../../../util/twemojify';
import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import {
  selectRoom,
  // openReusableContextMenu
} from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';
import { isRoomAliasAvailable, getIdServer } from '../../../util/matrixUtil';
// import { getEventCords } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import Toggle from '../../atoms/button/Toggle';
import IconButton from '../../atoms/button/IconButton';
// import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
import Input from '../../atoms/input/Input';
import Spinner from '../../atoms/spinner/Spinner';
// import SegmentControl from '../../atoms/segmented-controls/SegmentedControls';
import Dialog from '../../molecules/dialog/Dialog';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import HashPlusIC from '../../../../public/res/ic/outlined/hash-plus.svg';
import SpacePlusIC from '../../../../public/res/ic/outlined/space-plus.svg';
// import HashIC from '../../../../public/res/ic/outlined/hash.svg';
// import HashLockIC from '../../../../public/res/ic/outlined/hash-lock.svg';
// import HashGlobeIC from '../../../../public/res/ic/outlined/hash-globe.svg';
// import SpaceIC from '../../../../public/res/ic/outlined/space.svg';
// import SpaceLockIC from '../../../../public/res/ic/outlined/space-lock.svg';
// import SpaceGlobeIC from '../../../../public/res/ic/outlined/space-globe.svg';
// import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg';
import CrossIC from '../../../../public/res/ic/outlined/cross.svg';
import { SmartAccountAtom } from '../../state/smartAccount';
import generateRandomString from '../../../util/randomString';

function CreateRoomContent({ isSpace, parentId, onRequestClose }) {
  const [smartAccount] = useAtom(SmartAccountAtom);
  const [joinRule] = useState(parentId ? 'restricted' : 'public');
  const [isEncrypted, setIsEncrypted] = useState(!isSpace);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [creatingError, setCreatingError] = useState(null);
  const [isValidAddress, setIsValidAddress] = useState(null);
  const [addressValue, setAddressValue] = useState(undefined);
  // const [roleIndex, setRoleIndex] = useState(0);
  const addressRef = useRef(null);
  const mx = initMatrix.matrixClient;
  const userHs = getIdServer(mx.getUserId());
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const { roomList } = initMatrix;
    const onCreated = (roomId) => {
      setIsCreatingRoom(false);
      setCreatingError(null);
      setIsValidAddress(null);
      setAddressValue(undefined);

      if (!mx.getRoom(roomId)?.isSpaceRoom()) {
        selectRoom(roomId);
      }
      onRequestClose();
    };
    roomList.on(cons.events.roomList.ROOM_CREATED, onCreated);
    return () => {
      roomList.removeListener(cons.events.roomList.ROOM_CREATED, onCreated);
    };
  }, []);


  const action = () => (
    creatingError === 'Please verify your twitter first' ?
      <button style={{ color: 'var(--tc-primary-high)', fontWeight: 'var(--fw-medium)', backgroundColor: 'var(--bg-primary)', padding: 'var(--sp-extra-tight)', borderRadius: 'var(--bo-radius)', cursor: 'pointer' }} onClick={() => { window.open(import.meta.env.VITE_APP_PROOF_URL, "_blank") }}>
        Verify Now
      </button> : null
  );


  useEffect(() => {
    if (creatingError)
      enqueueSnackbar(creatingError, { variant: creatingError === 'Please verify your twitter first' ? 'warning' : 'error', action, autoHideDuration: '10000' })
  }, [creatingError])

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { target } = evt;

    setIsCreatingRoom(true);
    setCreatingError(null);

    const name = target.name.value;
    let topic = target.topic.value;
    if (topic.trim() === '') topic = undefined;
    let roomAlias;

    if (joinRule === 'public') {
      roomAlias = addressRef?.current?.value;
      if (roomAlias.trim() === '') return false;
    }

    else if (!isSpace) {
      roomAlias = name.toLowerCase().trim('').replace(/\s+/g, '').concat('_').concat(generateRandomString(6, true));
    }

    // const powerLevel = roleIndex === 1 ? 101 : undefined;
    const powerLevel = 101;
    const fee = target?.fee?.value || null;

    try {
      const result = await roomActions.createRoom({
        name,
        topic,
        joinRule,
        alias: roomAlias,
        isEncrypted,
        powerLevel,
        isSpace,
        parentId,
        fee,
        smartAccount
      });

      result && enqueueSnackbar('Create success', { variant: 'success' }) && onRequestClose()
      !result && setCreatingError('Create Room Failed');
      setIsCreatingRoom(false)
    } catch (e) {
      if (e.message === 'M_UNKNOWN: Invalid characters in room alias') {
        setCreatingError('ERROR: Invalid characters in address');
        setIsValidAddress(false);
      } else if (e.message === 'M_ROOM_IN_USE: Room alias already taken') {
        setCreatingError('ERROR: This address is already in use');
        setIsValidAddress(false);
      } else setCreatingError(e.message);
      setIsCreatingRoom(false);
    }
  };

  const validateAddress = (e) => {
    const myAddress = e.target.value;
    setIsValidAddress(null);

    const address = e.target.value ? (e.target.value).replaceAll(' ', '').toLowerCase().concat('_').concat(generateRandomString(6, true)) : null;
    setAddressValue(address);
    setCreatingError(null);

    setTimeout(async () => {
      if (myAddress !== addressRef.current.value) return;
      const roomAlias = addressRef.current.value;
      if (roomAlias === '') return;
      const roomAddress = `#${roomAlias}:${userHs}`;

      if (await isRoomAliasAvailable(roomAddress)) {
        setIsValidAddress(true);
      } else {
        setIsValidAddress(false);
      }
    }, 1000);
  };


  return (
    <div className="create-room">
      <form className="create-room__form" onSubmit={handleSubmit}>
        {/* <SettingTile
          title="Visibility"
          options={(
            <Button iconSrc={ChevronBottomIC}>
              {joinRule.toUpperCase()}
            </Button>
          )}
          content={<Text variant="b3">{`Select who can join this ${isSpace ? 'space' : 'room'}.`}</Text>}
        /> */}

        {!isSpace && joinRule !== 'public' && (
          <SettingTile
            title="Enable E2E encryption"
            options={<Toggle isActive={isEncrypted} onToggle={setIsEncrypted} />}
            content={<Text variant="b3">You can’t disable this later. <br /> Room with Encrypted will lost history when user don't storing session.</Text>}
          />
        )}
        {/* <SettingTile
          title="Select your role"
          options={(
            <SegmentControl
              selected={roleIndex}
              segments={[{ text: 'Admin' }, { text: 'Founder' }]}
              onSelect={setRoleIndex}
            />
          )}
          content={(
            <Text variant="b3">Admin : 100 power level <br /> Founder: 101 power level</Text>
          )}
        /> */}

        <div className="create-room__name-wrapper">
          <Input name="name" label={`${isSpace ? 'Space' : 'Room'} name`} required onChange={validateAddress} />
          {!isSpace && <Input name="fee" label="Join room fees (ETH)" required />}
          <Button
            disabled={isValidAddress === false || isCreatingRoom}
            iconSrc={isSpace ? SpacePlusIC : HashPlusIC}
            type="submit"
            variant="primary"
          >
            Create
          </Button>
        </div>

        <Input name="topic" minHeight={174} resizable label="Topic (optional)" />

        {joinRule === 'public' && (
          <div>
            <Text className="create-room__address__label" variant="b2">{isSpace ? 'Space address' : 'Room address'}</Text>
            <div className="create-room__address">
              <Text variant="b1">#</Text>
              <Input
                value={addressValue}
                onChange={null}
                state={(isValidAddress === false) ? 'error' : 'normal'}
                forwardRef={addressRef}
                placeholder="my_address"
                disabled
                required
              />
              <Text variant="b1">{`:${userHs}`}</Text>
            </div>
            {isValidAddress === false && <Text className="create-room__address__tip" variant="b3"><span style={{ color: 'var(--bg-danger)' }}>{`#${addressValue}:${userHs} is already in use`}</span></Text>}
          </div>
        )}

        {
          isCreatingRoom && (
            <div className="create-room__loading">
              <Spinner size="small" />
              <Text>{`Creating ${isSpace ? 'space' : 'room'}...`}</Text>
            </div>
          )
        }

      </form >
    </div >
  );
}
CreateRoomContent.defaultProps = {
  parentId: null,
};
CreateRoomContent.propTypes = {
  isSpace: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired,
};

function useWindowToggle() {
  const [create, setCreate] = useState(null);

  useEffect(() => {
    const handleOpen = (isSpace, parentId) => {
      setCreate({
        isSpace,
        parentId,
      });
    };
    navigation.on(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen);
    return () => {
      navigation.removeListener(cons.events.navigation.CREATE_ROOM_OPENED, handleOpen);
    };
  }, []);

  const onRequestClose = () => setCreate(null);
  return [create, onRequestClose];
}

function CreateRoom() {
  const [create, onRequestClose] = useWindowToggle();
  const { isSpace, parentId } = create ?? {};
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(parentId);

  return (
    <Dialog
      isOpen={create !== null}
      title={(
        <Text variant="s1" weight="medium" primary>
          {parentId ? twemojify(room.name) : 'Home'}
          <span style={{ color: 'var(--tc-surface-low)' }}>
            {` — create ${isSpace ? 'space' : 'room'}`}
          </span>
        </Text>
      )}
      contentOptions={<IconButton src={CrossIC} onClick={onRequestClose} tooltip="Close" />}
      onRequestClose={onRequestClose}
    >
      {
        create
          ? (
            <CreateRoomContent
              isSpace={isSpace}
              parentId={parentId}
              onRequestClose={onRequestClose}
            />
          ) : <div />
      }
    </Dialog>
  );
}

export default CreateRoom;
