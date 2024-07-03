/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';

import { ConnectButton, useAccountInfo, useConnectKit } from '@particle-network/connectkit';
import { Buffer } from 'buffer';
import { useAtom } from 'jotai';
import {
  Box,
  Icon,
  Icons,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  Spinner,
  Text,
  color,
  config,
} from 'folds';
import { SmartAccount } from '@particle-network/aa';
import { EthereumSepolia } from '@particle-network/chains';
import { MatrixError } from 'matrix-js-sdk';
import { useSnackbar } from 'notistack';
import { SmartAccountAtom } from '../../../state/smartAccount';
import { useAutoDiscoveryInfo } from '../../../hooks/useAutoDiscoveryInfo';
import { AsyncStatus, useAsyncCallback } from '../../../hooks/useAsyncCallback';
import { CustomLoginResponse, LoginError, login, useLoginComplete } from './loginUtil';

function LoginTokenError({ message }: { message: string }) {
  return (
    <Box
      style={{
        backgroundColor: color.Critical.Container,
        color: color.Critical.OnContainer,
        padding: config.space.S300,
        borderRadius: config.radii.R400,
      }}
      justifyContent="Start"
      alignItems="Start"
      gap="300"
    >
      <Icon size="300" filled src={Icons.Warning} />
      <Box direction="Column" gap="100">
        <Text size="L400">Login Failed</Text>
        <Text size="T300">
          <b>{message}</b>
        </Text>
      </Box>
    </Box>
  );
}

const getNonce = async (address: any) => {
  const add = address.toString().toLowerCase();

  const response = await fetch(`${import.meta.env.VITE_APP_AUTH_URL}/api/v1/get-msg?address=${add}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },

  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.message;
};

async function postNonce(msg: any, setSignedMessage: any, setToken: any, setErr: any) {
  const postData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_AUTH_URL}/api/v1/get-jwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1000',
        },
        body: JSON.stringify({ signature: setSignedMessage, msg }),

      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      if (error)
        throw new Error(error as unknown as string)
      else
        throw new Error('Undefined Error')
    }

  };
  postData();
};

export function Login() {
  const [_, setSmartAccount] = useAtom(SmartAccountAtom);
  const [err, setErr] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const connectkit = useConnectKit()
  const { account, particleProvider }: { particleProvider: any, account: string | undefined } = useAccountInfo();
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    async function LoadToken() {
      const smartAccount = new SmartAccount(particleProvider as any, {
        projectId: String(import.meta.env.VITE_APP_PROJECT_ID),
        clientKey: String(import.meta.env.VITE_APP_CLIENT_KEY),
        appId: String(import.meta.env.VITE_APP_APP_ID),
        aaOptions: {
          simple: [{ chainId: EthereumSepolia.id, version: '1.0.0' }]
        }
      });

      setSmartAccount(smartAccount);

      try {
        const add = await smartAccount.getAddress();
        const msg = await getNonce(add);

        const signature = await particleProvider.request({
          method: 'personal_sign',
          params: [`0x${Buffer.from(msg).toString('hex')}`, account],
        });

        await postNonce(msg, signature, setToken, setErr)
      } catch (error: any) {
        connectkit?.disconnect()
        particleProvider?.disconnect()
        setErr(error?.message)
      }
    }

    if (account && particleProvider) {
      LoadToken();
    }

  }, [account, particleProvider]);

  useEffect(() => {
    if (err)
      enqueueSnackbar(err, { variant: 'error' })
  }, [err])

  function TokenLogin() {
    const discovery = useAutoDiscoveryInfo();
    const baseUrl = discovery['m.homeserver'].base_url;
    const [loginState, startLogin] = useAsyncCallback<
      CustomLoginResponse,
      MatrixError,
      Parameters<typeof login>
    >(useCallback(login, []));

    useEffect(() => {
      startLogin(baseUrl, {
        type: 'org.matrix.login.token',
        token,
      });
    }, [baseUrl, token, startLogin]);

    useLoginComplete(loginState.status === AsyncStatus.Success ? loginState.data : undefined);

    useEffect(() => {
      if (loginState.status === AsyncStatus.Error) {
        if (loginState.error.errcode === LoginError.Forbidden) {
          setErr("Invalid login token")
        }
        if (loginState.error.errcode === LoginError.UserDeactivated) {
          setErr("This account has been deactivated.")
        }
        if (loginState.error.errcode === LoginError.InvalidRequest) {
          setErr("Failed to login. Part of your request data is invalid.")
        }
        if (loginState.error.errcode === LoginError.RateLimited) {
          setErr("Failed to login. Your login request has been rate-limited by server, Please try after some time.")

        }
        if (loginState.error.errcode === LoginError.Unknown) {
          setErr("Failed to login. Unknown reason.")
        }

        connectkit.disconnect()
      }
    }, [loginState, setErr])

    return (
      <Overlay open={loginState.status !== AsyncStatus.Error} backdrop={<OverlayBackdrop />}>
        <OverlayCenter>
          <Spinner size="600" variant="Secondary" />
        </OverlayCenter>
      </Overlay>
    );
  }

  return (
    <>
      {account && !err && <Spinner />}
      {!account && <ConnectButton />}
      {token && <TokenLogin />}
    </>
  );
}
