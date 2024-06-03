/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-destructuring */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './DrawerHeader.scss';

import { hexValue } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { twemojify } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import {
  openCreateRoom, openSpaceManage,
  // openJoinAlias,
  openInviteUser, openReusableContextMenu, openPublicRooms
} from '../../../client/action/navigation';
import { getEventCords } from '../../../util/common';

import { blurOnBubbling } from '../../atoms/button/script';

import Text from '../../atoms/text/Text';
import RawIcon from '../../atoms/system-icons/RawIcon';
import Header, { TitleWrapper } from '../../atoms/header/Header';
import IconButton from '../../atoms/button/IconButton';
import { MenuItem, MenuHeader } from '../../atoms/context-menu/ContextMenu';
import SpaceOptions from '../../molecules/space-options/SpaceOptions';

import PlusIC from '../../../../public/res/ic/outlined/plus.svg';
import HashPlusIC from '../../../../public/res/ic/outlined/hash-plus.svg';
import HashSearchIC from '../../../../public/res/ic/outlined/hash-search.svg';
import SpacePlusIC from '../../../../public/res/ic/outlined/space-plus.svg';
import ChevronBottomIC from '../../../../public/res/ic/outlined/chevron-bottom.svg';
import HashGlobeIC from '../../../../public/res/ic/outlined/hash-globe.svg'
import { SmartAccountAtom } from '../../state/smartAccount';

export function HomeSpaceOptions({ spaceId, afterOptionSelect }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(spaceId);
  const canManage = room
    ? room.currentState.maySendStateEvent('m.space.child', mx.getUserId())
    : true;
  const [smartAccount] = useAtom(SmartAccountAtom);

  const [canCreate, setCancreate] = useState(false);

  useEffect(() => {
    if (!spaceId && smartAccount) {
      const check = async () => {
        const checking = async () => {
          const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
          const address = await smartAccount.getAddress()
          const ABICheck = [{
            "inputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "name": "spaces",
            "outputs": [
              {
                "internalType": "address",
                "name": "spaceOwner",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },]

          try {
            const provider = new ethers.providers.WebSocketProvider('wss://sepolia.gateway.tenderly.co');
            const contract = new ethers.Contract(contractAddress, ABICheck, provider)
            const result = await contract.callStatic.spaces(address)
            return hexValue(result).toLowerCase() !== address.toLowerCase();
          }

          catch (e) {
            return false
          }
        }

        setCancreate(await checking());
      }

      check()
    }


  }, [smartAccount])

  return (
    <>
      <MenuHeader>{!spaceId ? 'Create space' : "Create rooms"}</MenuHeader>
      {
        !spaceId && <MenuItem
          iconSrc={SpacePlusIC}
          onClick={() => { canCreate ? (afterOptionSelect(), openCreateRoom(true, spaceId)) : undefined }}
          disabled={!canManage || !canCreate}
        >
          Create new space
        </MenuItem >
      }
      {
        !spaceId && (
          <MenuItem
            iconSrc={HashGlobeIC}
            onClick={() => { afterOptionSelect(); openPublicRooms(); }}
          >
            Explore Spaces
          </MenuItem>
        )
      }
      {/* {!spaceId && (
        <MenuItem
          iconSrc={PlusIC}
          onClick={() => { afterOptionSelect(); openJoinAlias(); }}
        >
          Join with address
        </MenuItem>
      )} */}
      {
        spaceId &&
        <MenuItem
          iconSrc={HashPlusIC}
          onClick={() => { afterOptionSelect(); openCreateRoom(false, spaceId); }}
          disabled={!canManage}
        >
          Create new room
        </MenuItem>
      }
      {/* {spaceId && (
        <MenuItem
          iconSrc={PlusIC}
          onClick={() => { afterOptionSelect(); openSpaceAddExisting(spaceId); }}
          disabled={!canManage}
        >
          Add existing
        </MenuItem>
      )} */}
      {
        spaceId && (
          <MenuItem
            onClick={() => { afterOptionSelect(); openSpaceManage(spaceId); }}
            iconSrc={HashSearchIC}
          >
            Manage rooms
          </MenuItem>
        )
      }
    </>
  );
}
HomeSpaceOptions.defaultProps = {
  spaceId: null,
};
HomeSpaceOptions.propTypes = {
  spaceId: PropTypes.string,
  afterOptionSelect: PropTypes.func.isRequired,
};

function DrawerHeader({ selectedTab, spaceId }) {
  const mx = initMatrix.matrixClient;
  const tabName = selectedTab !== cons.tabs.DIRECTS ? 'Home' : 'Direct messages';

  const isDMTab = selectedTab === cons.tabs.DIRECTS;
  const room = mx.getRoom(spaceId);
  const spaceName = isDMTab ? null : (room?.name || null);

  const openSpaceOptions = (e) => {
    e.preventDefault();
    openReusableContextMenu(
      'bottom',
      getEventCords(e, '.header'),
      (closeMenu) => <SpaceOptions roomId={spaceId} afterOptionSelect={closeMenu} />,
    );
  };

  const openHomeSpaceOptions = (e) => {
    e.preventDefault();
    openReusableContextMenu(
      'right',
      getEventCords(e, '.ic-btn'),
      (closeMenu) => <HomeSpaceOptions spaceId={spaceId} afterOptionSelect={closeMenu} />,
    );
  };

  return (
    <Header>
      {spaceName ? (
        <button
          className="drawer-header__btn"
          onClick={openSpaceOptions}
          type="button"
          onMouseUp={(e) => blurOnBubbling(e, '.drawer-header__btn')}
        >
          <TitleWrapper>
            <Text variant="s1" weight="medium" primary>{twemojify(spaceName)}</Text>
          </TitleWrapper>
          <RawIcon size="small" src={ChevronBottomIC} />
        </button>
      ) : (
        <TitleWrapper>
          <Text variant="s1" weight="medium" primary>{tabName}</Text>
        </TitleWrapper>
      )}

      {isDMTab && <IconButton onClick={() => openInviteUser()} tooltip="Start DM" src={PlusIC} size="small" />}
      {!isDMTab && <IconButton onClick={openHomeSpaceOptions} tooltip="Add rooms/spaces" src={PlusIC} size="small" />}
    </Header>
  );
}

DrawerHeader.defaultProps = {
  spaceId: null,
};
DrawerHeader.propTypes = {
  selectedTab: PropTypes.string.isRequired,
  spaceId: PropTypes.string,
};

export default DrawerHeader;
