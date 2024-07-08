/* eslint-disable no-console */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SpaceWithdraw.scss';

import { Box } from 'folds';
import { useAtom } from 'jotai';
import { enqueueSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { twemojify } from '../../../util/twemojify';
import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import colorMXID from '../../../util/colorMXID';
import RoomsHierarchy from '../../../client/state/RoomsHierarchy';
import { joinRuleToIconSrc } from '../../../util/matrixUtil';
import { getFee, getPercentage, Withdraw } from '../../../client/action/room';
import { Debounce } from '../../../util/common';

import Text from '../../atoms/text/Text';
import RawIcon from '../../atoms/system-icons/RawIcon';
import Button from '../../atoms/button/Button';
import IconButton from '../../atoms/button/IconButton';
import Avatar from '../../atoms/avatar/Avatar';
import Spinner from '../../atoms/spinner/Spinner';
import ScrollView from '../../atoms/scroll/ScrollView';
import PopupWindow from '../../molecules/popup-window/PopupWindow';

import CrossIC from '../../../../public/res/ic/outlined/cross.svg';
import ChevronRightIC from '../../../../public/res/ic/outlined/chevron-right.svg';
// import InfoIC from '../../../../public/res/ic/outlined/info.svg';

import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useStore } from '../../hooks/useStore';
import { SmartAccountAtom } from '../../state/smartAccount';

function SpaceWithdrawBreadcrumb({ path, onSelect }) {
  return (
    <div className="space-manage-breadcrumb__wrapper">
      <ScrollView horizontal vertical={false} invisible>
        <div className="space-manage-breadcrumb">
          {
            path.map((item, index) => (
              <React.Fragment key={item.roomId}>
                {index > 0 && <RawIcon size="extra-small" src={ChevronRightIC} />}
                <Button onClick={() => onSelect(item.roomId, item.name)}>
                  <Text variant="b2">{twemojify(item.name)}</Text>
                </Button>
              </React.Fragment>
            ))
          }
        </div>
      </ScrollView>
    </div>
  );
}
SpaceWithdrawBreadcrumb.propTypes = {
  path: PropTypes.arrayOf(PropTypes.exact({
    roomId: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  onSelect: PropTypes.func.isRequired,
};

function SpaceWithdrawItem({
  roomInfo, onSpaceClick, creator
}) {
  const [isExpand, setIsExpand] = useState(false);
  const mx = initMatrix.matrixClient;
  const isSpace = roomInfo.room_type === 'm.space';

  const roomId = roomInfo.room_id;
  const [fee, setRoomFee] = useState(0)

  useEffect(() => {
    const setfee = async () => {
      const res = await getFee(creator, roomId)
      setRoomFee(res)
    }
    setfee()
  }, [])

  const room = mx.getRoom(roomId);
  const name = room?.name || roomInfo.name || roomInfo.canonical_alias || roomId;
  let imageSrc = mx.mxcUrlToHttp(roomInfo.avatar_url, 24, 24, 'crop') || null;
  if (!imageSrc && room) {
    imageSrc = room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;
    if (imageSrc === null) imageSrc = room.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;
  }

  const roomAvatarJSX = (
    <Avatar
      text={name}
      bgColor={colorMXID(roomId)}
      imageSrc={null}
      iconColor="var(--ic-surface-low)"
      iconSrc={
        joinRuleToIconSrc((roomInfo.join_rules || roomInfo.join_rule), isSpace)
      }
      size="extra-small"
    />
  );
  const roomNameJSX = (
    <Text>
      {twemojify(name)}
      <Text variant="b3" span>{` • ${roomInfo.num_joined_members} members`}</Text>
    </Text>
  );

  // const expandBtnJsx = (
  //   <IconButton
  //     variant={isExpand ? 'primary' : 'surface'}
  //     size="extra-small"
  //     src={InfoIC}
  //     tooltip="Topic"
  //     tooltipPlacement="top"
  //     onClick={() => setIsExpand(!isExpand)}
  //   />
  // );

  return (
    <div
      className={`space-manage-item${isSpace ? '--space' : ''}`}
    >
      <div>
        <button
          className="space-manage-item__btn"
          onClick={isSpace ? () => onSpaceClick(roomId, name) : null}
          type="button"
        >
          {roomAvatarJSX}
          {roomNameJSX}
        </button>
        {/* {roomInfo.topic && expandBtnJsx} */}
        <Box direction='Row' alignItems='Center' gap='300'>
          <Text variant='b3' weight='bold'>{fee} ETH</Text>
        </Box>
      </div>
      {isExpand && roomInfo.topic && <Text variant="b2">{twemojify(roomInfo.topic, undefined, true)}</Text>}
    </div>
  );
}

SpaceWithdrawItem.propTypes = {
  roomInfo: PropTypes.shape({}).isRequired,
  onSpaceClick: PropTypes.func.isRequired,
  creator: PropTypes.string.isRequired,
};

function useSpacePath(roomId) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const [spacePath, setSpacePath] = useState([{ roomId, name: room.name }]);

  const addPathItem = (rId, name) => {
    const newPath = [...spacePath];
    const itemIndex = newPath.findIndex((item) => item.roomId === rId);
    if (itemIndex < 0) {
      newPath.push({ roomId: rId, name });
      setSpacePath(newPath);
      return;
    }
    newPath.splice(itemIndex + 1);
    setSpacePath(newPath);
  };

  return [spacePath, addPathItem];
}

function useUpdateOnJoin(roomId) {
  const [, forceUpdate] = useForceUpdate();
  const { roomList } = initMatrix;

  useEffect(() => {
    const handleRoomList = () => forceUpdate();

    roomList.on(cons.events.roomList.ROOM_JOINED, handleRoomList);
    roomList.on(cons.events.roomList.ROOM_LEAVED, handleRoomList);
    return () => {
      roomList.removeListener(cons.events.roomList.ROOM_JOINED, handleRoomList);
      roomList.removeListener(cons.events.roomList.ROOM_LEAVED, handleRoomList);
    };
  }, [roomId]);
}

function useChildUpdate(roomId, roomsHierarchy) {
  const [, forceUpdate] = useForceUpdate();
  const [debounce] = useState(new Debounce());
  const mx = initMatrix.matrixClient;

  useEffect(() => {
    let isMounted = true;
    const handleStateEvent = (event) => {
      if (event.getRoomId() !== roomId) return;
      if (event.getType() !== 'm.space.child') return;

      debounce._(() => {
        if (!isMounted) return;
        roomsHierarchy.removeHierarchy(roomId);
        forceUpdate();
      }, 500)();
    };
    mx.on('RoomState.events', handleStateEvent);
    return () => {
      isMounted = false;
      mx.removeListener('RoomState.events', handleStateEvent);
    };
  }, [roomId, roomsHierarchy]);
}

function SpaceWithdrawContent({ roomId }) {
  const mx = initMatrix.matrixClient;
  useUpdateOnJoin(roomId);
  const [, forceUpdate] = useForceUpdate();
  const [percentage, setPercentage] = useState(0)
  const [roomsHierarchy] = useState(new RoomsHierarchy(mx, 10));
  const [spacePath, addPathItem] = useSpacePath(roomId);
  const [isLoading, setIsLoading] = useState(true);
  const [withDrawing, setWithDrawing] = useState(false)
  const [error, setError] = useState(undefined)
  const mountStore = useStore();
  const currentPath = spacePath[spacePath.length - 1];
  useChildUpdate(currentPath.roomId, roomsHierarchy);
  const currentHierarchy = roomsHierarchy.getHierarchy(currentPath.roomId);
  const creator = mx.getRoom(roomId).getCreator().substring(1, mx.getRoom(roomId).getCreator().indexOf(':'));

  const [smartAccount,] = useAtom(SmartAccountAtom)

  useEffect(() => {
    mountStore.setItem(true);
    Promise.resolve(getPercentage()).then(res => setPercentage(res))
    return () => {
      mountStore.setItem(false);
    };
  }, [roomId, currentHierarchy]);


  const loadRoomHierarchy = async () => {
    if (!roomsHierarchy.canLoadMore(currentPath.roomId)) return;
    setIsLoading(true);
    try {
      await roomsHierarchy.load(currentPath.roomId);
      if (!mountStore.getItem()) return;
      setIsLoading(false);
      forceUpdate();
    } catch {
      if (!mountStore.getItem()) return;
      setIsLoading(false);
      forceUpdate();
    }
  };



  const withDraw = async () => {
    setWithDrawing(true)
    try {
      const result = await Withdraw(smartAccount)
      const action = () => (
        <button type='button' style={{ color: 'var(--tc-primary-high)', fontWeight: 'var(--fw-medium)', backgroundColor: 'var(--bg-primary)', padding: 'var(--sp-extra-tight)', borderRadius: 'var(--bo-radius)', cursor: 'pointer' }} onClick={() => { window.open(`https://sepolia.etherscan.io/tx/${result}`, "_blank") }}>
          View txHash
        </button>
      );

      enqueueSnackbar('Withdraw success', { variant: 'success', action, autoHideDuration: '10000' })
    }

    catch (e) {
      setError(e.message || e)
    }
    setWithDrawing(false)
  }

  useEffect(() => { if (error) enqueueSnackbar(error, { variant: 'error' }) }, [error])

  if (!currentHierarchy) loadRoomHierarchy();

  return (
    <div className="space-manage__content">
      {spacePath.length > 1 && (
        <SpaceWithdrawBreadcrumb path={spacePath} onSelect={addPathItem} />
      )}
      <Text variant="b2" weight="bold">Withdraw Percentage : {percentage}%</Text>
      <Box className='space-manage__content' direction='Row' justifyContent='SpaceBetween'>
        <Text variant="b3" weight="bold">Rooms</Text>
        <Text variant="b3" weight="bold">Rooms FEE</Text>
      </Box>
      <div className="space-manage__content-items">
        {!isLoading && currentHierarchy?.rooms?.length === 1 && (
          <Text>
            You need to create room first
          </Text>
        )}
        {currentHierarchy?.rooms?.map((roomInfo) => (
          roomInfo.room_id === currentPath.roomId
            ? null
            : (
              <SpaceWithdrawItem
                key={roomInfo.room_id}
                roomInfo={roomInfo}
                onSpaceClick={addPathItem}
                creator={creator}
              />
            )
        ))}
        {!currentHierarchy && <Text>loading...</Text>}
      </div>
      {currentHierarchy?.canLoadMore && !isLoading && (
        <Button onClick={loadRoomHierarchy}>Load more</Button>
      )}

      <Box className='withdraw' direction='Row' gap='300' alignItems='Center' justifyContent='End'>
        <Button disabled={withDrawing} variant='primary' onClick={withDraw}>Withdraw</Button>
      </Box>
      {
        isLoading && (
          <div className="space-manage__content-loading">
            <Spinner size="small" />
            <Text>Loading rooms...</Text>
          </div>
        )
      }
    </div >
  );
}
SpaceWithdrawContent.propTypes = {
  roomId: PropTypes.string.isRequired,
};

function useWindowToggle() {
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const openSpaceWithdraw = (rId) => {
      setRoomId(rId);
    };
    navigation.on(cons.events.navigation.SPACE_WITHDRAW_MANAGE, openSpaceWithdraw);
    return () => {
      navigation.removeListener(cons.events.navigation.SPACE_WITHDRAW_MANAGE, openSpaceWithdraw);
    };
  }, []);

  const requestClose = () => setRoomId(null);

  return [roomId, requestClose];
}

function SpaceWithdraw() {
  const mx = initMatrix.matrixClient;
  const [roomId, requestClose] = useWindowToggle();
  const room = mx.getRoom(roomId);

  return (
    <PopupWindow
      isOpen={roomId !== null}
      className="space-manage"
      title={(
        <Text variant="s1" weight="medium" primary>
          {roomId && twemojify(room.name)}
          <span style={{ color: 'var(--tc-surface-low)' }}> — withdraw</span>
        </Text>
      )}
      contentOptions={<IconButton src={CrossIC} onClick={requestClose} tooltip="Close" />}
      onRequestClose={requestClose}
    >
      {
        roomId
          ? <SpaceWithdrawContent roomId={roomId} requestClose={requestClose} />
          : <div />
      }
    </PopupWindow>
  );
}

export default SpaceWithdraw;
