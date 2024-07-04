/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// import { twemojify } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import { openInviteUser, toggleRoomSettings } from '../../../client/action/navigation';
import * as roomActions from '../../../client/action/room';
import { markAsRead } from '../../../client/action/notifications';

import {
  // MenuHeader,
  MenuItem
} from '../../atoms/context-menu/ContextMenu';
// import RoomNotification from '../room-notification/RoomNotification';

import TickMarkIC from '../../../../public/res/ic/outlined/tick-mark.svg';
import AddUserIC from '../../../../public/res/ic/outlined/add-user.svg';
import LeaveArrowIC from '../../../../public/res/ic/outlined/leave-arrow.svg';
import HeartSVG from '../../../../public/res/ic/filled/heart.svg'
import SettingsIC from '../../../../public/res/ic/outlined/settings.svg';

import { confirmDialog } from '../confirm-dialog/ConfirmDialog';


function RoomOptions({ roomId, afterOptionSelect }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const canInvite = room?.canInvite(mx.getUserId());
  const [canVote, setCanVote] = useState(false)
  const creator = room.getCreator().substring(1, room.getCreator().indexOf(':'));
  const subscriber = mx.getUserId().substring(1, mx.getUserId().indexOf(':'));

  const handleMarkAsRead = () => {
    markAsRead(roomId);
    afterOptionSelect();
  };

  const handleInviteClick = () => {
    openInviteUser(roomId);
    afterOptionSelect();
  };

  const handleVotingClick = async () => {
    afterOptionSelect();
    await confirmDialog(
      'Voting room',
      `Voting for "${room.name}" room`,
      'Vote',
      'primary',
      [true, canVote, creator, roomId]
    );
  }

  const handleLeaveClick = async () => {
    afterOptionSelect();
    const isConfirmed = await confirmDialog(
      'Leave room',
      `Are you sure that you want to leave "${room.name}" room?`,
      'Leave',
      'danger',
    );
    if (!isConfirmed) return;
    roomActions.leave(roomId);
  };

  useEffect(() => {
    const canvote = async () => {
      const res = await roomActions.hasVoted(creator, roomId, subscriber)
      setCanVote(!res)
    }
    canvote()
  }, [])

  return (
    <div style={{ maxWidth: '256px' }}>
      {/* <MenuHeader>{twemojify(`Options for ${initMatrix.matrixClient.getRoom(roomId)?.name}`)}</MenuHeader> */}
      <MenuItem iconSrc={TickMarkIC} onClick={handleMarkAsRead}>Mark as read</MenuItem>
      <MenuItem
        iconSrc={AddUserIC}
        onClick={handleInviteClick}
        disabled={!canInvite}
      >
        Invite
      </MenuItem>
      {!initMatrix.roomList.directs.has(roomId) && <MenuItem iconSrc={HeartSVG} onClick={handleVotingClick}>Voting</MenuItem>}
      <MenuItem iconSrc={LeaveArrowIC} variant="danger" onClick={handleLeaveClick}>Leave</MenuItem>
      <MenuItem onClick={() => { toggleRoomSettings(); afterOptionSelect(); }} iconSrc={SettingsIC}>Settings</MenuItem>
      {/* <MenuHeader>Notification</MenuHeader> */}
      {/* <RoomNotification roomId={roomId} /> */}
    </div>
  );
}

RoomOptions.defaultProps = {
  afterOptionSelect: null,
};

RoomOptions.propTypes = {
  roomId: PropTypes.string.isRequired,
  afterOptionSelect: PropTypes.func,
};

export default RoomOptions;
