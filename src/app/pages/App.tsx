import React from 'react';
import { Provider as JotaiProvider } from 'jotai';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
  createRoutesFromElements,
  redirect,
} from 'react-router-dom';

import { ClientConfigLoader } from '../components/ClientConfigLoader';
import { ClientConfig, ClientConfigProvider } from '../hooks/useClientConfig';
import { AuthLayout, Login, authLayoutLoader } from './auth';
import { LOGIN_PATH, ROOT_PATH } from './paths';
import { isAuthenticated } from '../../client/state/auth';
import Client from '../templates/client/Client';
import { getLoginPath } from './pathUtils';
import { ConfigConfigError, ConfigConfigLoading } from './ConfigConfig';
import { FeatureCheck } from './FeatureCheck';
import { EthereumSepolia } from '@particle-network/chains';
import { ModalProvider } from '@particle-network/connectkit';
import { evmWallets } from '@particle-network/connectors';
const projectId = import.meta.env.VITE_APP_PROJECT_ID as string;
const clientKey = import.meta.env.VITE_APP_CLIENT_KEY as string;
const appId = import.meta.env.VITE_APP_APP_ID as string;

const createRouter = (clientConfig: ClientConfig) => {
  const { hashRouter } = clientConfig;

  const routes = createRoutesFromElements(
    <Route>
      <Route
        path={ROOT_PATH}
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
        <Route path="/direct" element={<p>direct</p>} />
        <Route path="/:spaceIdOrAlias" element={<p>:spaceIdOrAlias</p>} />
        <Route path="/explore" element={<p>explore</p>} />
      </Route>
      <Route path="/*" element={<p>Page not found</p>} />
    </Route>
  );

  if (hashRouter?.enabled) {
    return createHashRouter(routes, { basename: hashRouter.basename });
  }
  return createBrowserRouter(routes, {
    basename: import.meta.env.BASE_URL,
  });
};

// TODO: app crash boundary
function App() {
  return (
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
                <RouterProvider router={createRouter(clientConfig)} />
              </ModalProvider>
            </JotaiProvider>
          </ClientConfigProvider>

        )}
      </ClientConfigLoader>
    </FeatureCheck>
  );
}

export default App;
