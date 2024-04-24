import React, { useState } from 'react';
import { EthereumSepolia } from '@particle-network/chains';
import { ModalProvider } from '@particle-network/connectkit';
import '@particle-network/connectkit/dist/index.css';
import { evmWallets } from '@particle-network/connectors';
import ConnectKitDemo from './connectKitDemo';
const projectId = import.meta.env.VITE_APP_PROJECT_ID as string;
const clientKey = import.meta.env.VITE_APP_CLIENT_KEY as string;
const appId = import.meta.env.VITE_APP_APP_ID as string;

export function Login() {
  const [token, setToken] = useState<string | null>(null);
  return (
    <ModalProvider
      options={{
        projectId,
        clientKey,
        appId,
        chains: [EthereumSepolia],
        connectors: [
          ...evmWallets({ projectId: '2b508ce9975b8f0ccd539a24438696e2', showQrModal: true }),
        ],
        erc4337: {
          name: 'SIMPLE',
          version: '1.0.0',
        },
        wallet: {
          topMenuType: 'close',
          customStyle: {
            supportChains: [EthereumSepolia],
          },
        },
      }}
      theme='dark'
    >
      <ConnectKitDemo />
    </ModalProvider>
  );
}
