import React, { useState, useEffect, useCallback } from 'react';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { openNavigation } from '../../../client/action/navigation';

import Welcome from '../../organisms/welcome/Welcome';
import { RoomBaseView } from '../../organisms/room/Room';

export function ClientContent() {
  const [roomInfo, setRoomInfo] = useState({
    room: null,
    eventId: null,
  });

  const mx = initMatrix.matrixClient;
  const rt = useCallback((rId) => mx.getRoom(rId), [mx])

  useEffect(() => {
    const handleRoomSelected = (rId, pRoomId, eId) => {
      roomInfo.roomTimeline?.removeInternalListeners();
      const r = rt(rId);
      const userId = r?.myUserId;
      if (r && r?.currentState?.members?.[userId]?.membership === 'join') {
        setRoomInfo({
          room: r,
          eventId: eId ?? null,
        });
      } else {
        setRoomInfo({
          room: null,
          eventId: null,
        });
      }
    };

    navigation.on(cons.events.navigation.ROOM_SELECTED, handleRoomSelected);
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, handleRoomSelected);
    };
  }, [roomInfo, mx, rt]);

  const { room, eventId } = roomInfo;
  if (!room) {
    setTimeout(() => openNavigation());
    return <Welcome />;
  }

  return <RoomBaseView room={room} eventId={eventId} />;
}
