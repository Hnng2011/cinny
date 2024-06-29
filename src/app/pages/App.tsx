/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Provider as JotaiProvider } from 'jotai';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
} from 'react-router-dom';

import { EthereumSepolia } from '@particle-network/chains';
import { ModalProvider } from '@particle-network/connectkit';
import { evmWallets } from '@particle-network/connectors';
import { ClientConfigLoader } from '../components/ClientConfigLoader';
import { ClientConfigProvider } from '../hooks/useClientConfig';
import { AuthLayout, Login, authLayoutLoader } from './auth';
import { APP_PATH, LOGIN_PATH, ROOT_PATH } from './paths';
import { isAuthenticated } from '../../client/state/auth';
import Client from '../templates/client/Client';
import { getLoginPath } from './pathUtils';
import { ConfigConfigError, ConfigConfigLoading } from './ConfigConfig';
import { FeatureCheck } from './FeatureCheck';
import '@particle-network/connectkit/dist/index.css';
import Welcome from './welcome/welcome';

function ConnectKit({ children }: any) {
  return (
    <ModalProvider
      options={{
        projectId: import.meta.env.VITE_APP_PROJECT_ID as string,
        clientKey: import.meta.env.VITE_APP_CLIENT_KEY as string,
        appId: import.meta.env.VITE_APP_APP_ID as string,
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
      cacheProvider
    >
      {children}
    </ModalProvider>
  );
}



const createRouter = () => {
  const routes = createRoutesFromElements(
    [
      <Route>
        <Route
          path={APP_PATH}
          loader={() => {
            if (isAuthenticated()) return redirect('/home');
            return redirect(getLoginPath());
          }}
        />
        <Route loader={authLayoutLoader} element={<AuthLayout />}>
          <Route path={LOGIN_PATH} element={<Login />} />
        </Route>

        <Route
          loader={() => {
            if (!isAuthenticated()) return redirect(getLoginPath());
            return null;
          }}
        >
          <Route path="/home" element={<Client />} />
        </Route>
      </Route>,
      <Route path={ROOT_PATH} element={<Welcome />} />,
      <Route path="/*" element={<p>Page not found</p>} />
    ]
  );

  return createBrowserRouter(routes, {
    basename: import.meta.env.BASE_URL,
  });
};

// TODO: app crash boundary
function App() {
  return (
    <ConnectKit>
      <FeatureCheck>
        <ClientConfigLoader
          fallback={() => <ConfigConfigLoading />}
          error={(err, retry, ignore) => (
            <ConfigConfigError error={err} retry={retry} ignore={ignore} />
          )}
        >
          {(clientConfig) => (
            <ClientConfigProvider value={clientConfig}>
              <JotaiProvider>
                <RouterProvider router={createRouter()} />
              </JotaiProvider>
            </ClientConfigProvider>
          )}
        </ClientConfigLoader>
      </FeatureCheck>
    </ConnectKit>
  );
}

export default App;
