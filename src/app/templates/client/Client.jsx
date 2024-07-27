/* eslint-disable no-restricted-globals */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-expressions */
import React, { useState, useEffect, useRef } from 'react';
import './Client.scss';

import { useAccountInfo, useParticleConnect, useNetwork } from '@particle-network/connectkit';
import { SmartAccount } from '@particle-network/aa';
import { EthereumSepolia } from '@particle-network/chains';
import { useAtom } from 'jotai';
import { initHotkeys } from '../../../client/event/hotkeys';
import { initRoomListListener } from '../../../client/event/roomList';

import Text from '../../atoms/text/Text';
import Spinner from '../../atoms/spinner/Spinner';
import Navigation from '../../organisms/navigation/Navigation';
import
// ContextMenu,
{ MenuItem } from '../../atoms/context-menu/ContextMenu';
// import IconButton from '../../atoms/button/IconButton';
import ReusableContextMenu from '../../atoms/context-menu/ReusableContextMenu';
import Windows from '../../organisms/pw/Windows';
import Dialogs from '../../organisms/pw/Dialogs';

import initMatrix from '../../../client/initMatrix';
import navigation from '../../../client/state/navigation';
import cons from '../../../client/state/cons';

// import VerticalMenuIC from '../../../../public/res/ic/outlined/vertical-menu.svg';
import { MatrixClientProvider } from '../../hooks/useMatrixClient';
import { ClientContent } from './ClientContent';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';

import { SmartAccountAtom } from '../../state/smartAccount';

function SystemEmojiFeature() {
  const [twitterEmoji] = useSetting(settingsAtom, 'twitterEmoji');

  if (twitterEmoji) {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji');
  } else {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji_DISABLED');
  }

  return null;
}

function Client() {
  const { cacheconnect, connectKit: connectkit } = useParticleConnect();
  const { chain } = useNetwork()
  const { particleProvider, account } = useAccountInfo();
  const [smartAccount, setSmartAccount] = useAtom(SmartAccountAtom);
  const [isLoading, changeLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Heating up');
  const classNameHidden = 'client__item-hidden';

  const navWrapperRef = useRef(null);
  const roomWrapperRef = useRef(null);

  function onRoomSelected() {
    navWrapperRef.current?.classList.add(classNameHidden);
    roomWrapperRef.current?.classList.remove(classNameHidden);
  }
  function onNavigationSelected() {
    navWrapperRef.current?.classList.remove(classNameHidden);
    roomWrapperRef.current?.classList.add(classNameHidden);
  }

  useEffect(() => {
    navigation.on(cons.events.navigation.ROOM_SELECTED, onRoomSelected);
    navigation.on(cons.events.navigation.NAVIGATION_OPENED, onNavigationSelected);

    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, onRoomSelected);
      navigation.removeListener(cons.events.navigation.NAVIGATION_OPENED, onNavigationSelected);
    };
  }, []);


  useEffect(() => {
    changeLoading(true);
    if (!chain && !account)
      cacheconnect();

    if (chain && chain.id !== EthereumSepolia.id) {
      const switchchain = async () => {
        await connectkit.switchChain(EthereumSepolia)
      }

      switchchain()
    }

    if (chain && chain.id === EthereumSepolia.id) {
      let counter = 0;
      const iId = setInterval(() => {
        const msgList = ['Almost there...', 'Looks like you have a lot of stuff to heat up!'];
        if (counter === msgList.length - 1) {
          setLoadingMsg(msgList[msgList.length - 1]);
          clearInterval(iId);
          return;
        }
        setLoadingMsg(msgList[counter]);
        counter += 1;
      }, 15000);

      initMatrix.once('init_loading_finished', async () => {
        clearInterval(iId);
        initHotkeys();
        initRoomListListener(initMatrix.roomList);
        changeLoading(false);
      });

      initMatrix.init();
    }
  }, [chain]);

  useEffect(() => {
    !smartAccount && particleProvider &&
      setSmartAccount(new SmartAccount(particleProvider, {
        projectId: String(import.meta.env.VITE_APP_PROJECT_ID),
        clientKey: String(import.meta.env.VITE_APP_CLIENT_KEY),
        appId: String(import.meta.env.VITE_APP_APP_ID),
        aaOptions: {
          simple: [{ chainId: EthereumSepolia.id, version: '1.0.0' }]
        }
      }));

  }, [particleProvider])


  if (isLoading) {
    return (
      <div className="loading-display">
        <div className="loading__menu">
          <MenuItem variant='danger' onClick={() => location.reload()}>
            Clear cache & reload
          </MenuItem>

        </div>
        <Spinner />
        <div style={{ height: 'var(--sp-normal)' }} />

        <Text className="loading__message" variant="b2">
          {loadingMsg}
        </Text>

        <div className="loading__appname">
          <Text variant="h2" weight="medium">
            Ubiw.space
          </Text>
        </div>
      </div>
    );
  }

  return (
    <MatrixClientProvider value={initMatrix.matrixClient}>
      <div className="client-container">
        <div className="navigation__wrapper" ref={navWrapperRef}>
          <Navigation />
        </div>
        <div className={`room__wrapper ${classNameHidden}`} ref={roomWrapperRef}>
          <ClientContent />
        </div>
        <Windows />
        <Dialogs />
        <ReusableContextMenu />
        <SystemEmojiFeature />
      </div>
    </MatrixClientProvider>
  );
}

export default Client;
