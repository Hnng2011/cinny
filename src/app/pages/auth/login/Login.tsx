/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

import { ConnectButton, useAccountInfo, useConnectKit } from '@particle-network/connectkit';
import { Buffer } from 'buffer';
import { Box, Text, color } from 'folds';
import { useAtom } from 'jotai';
import { SmartAccount } from '@particle-network/aa';
import { EthereumSepolia } from '@particle-network/chains';
import { SmartAccountAtom } from '../../../state/smartAccount';
import Spinner from '../../../atoms/spinner/Spinner';
import { TokenLogin } from './TokenLogin';


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

async function postNonce(msg: any, setSignedMessage: any, setToken: any) {
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
      console.log('error', error);
    }
  };
  postData();
};


export function Login() {
  const connectKit = useConnectKit();
  const [_, setSmartAccount] = useAtom(SmartAccountAtom);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { account, particleProvider }: { particleProvider: any, account: string | undefined } = useAccountInfo();

  useEffect(() => {
    async function LoadToken() {
      const smartAccount = new SmartAccount(particleProvider, {
        projectId: String(import.meta.env.VITE_APP_PROJECT_ID),
        clientKey: String(import.meta.env.VITE_APP_CLIENT_KEY),
        appId: String(import.meta.env.VITE_APP_APP_ID),
        aaOptions: {
          simple: [{ chainId: EthereumSepolia.id, version: '1.0.0' }]
        }
      });

      setSmartAccount(smartAccount);

      const add = await smartAccount.getAddress();
      const msg = await getNonce(add);

      try {
        const signature = await particleProvider.request({
          method: 'personal_sign',
          params: [`0x${Buffer.from(msg).toString('hex')}`, account],
        });

        setMsg(msg);
        setSignedMessage(signature);

      } catch (error: any) {
        setErr(error?.message.toString());
        console.log('error', error?.message.toString());
      }
    }

    if (account && particleProvider) {
      if (err) {
        setErr(null);
      }

      LoadToken();
    }

  }, [account, particleProvider]);


  useEffect(() => {
    const getToken = async () => {
      await postNonce(msg, signedMessage, setToken)
    }

    if (signedMessage && msg) {
      getToken();
    }

  }, [signedMessage, msg]);

  return (
    <>
      {account && !err && <Spinner />}
      {err &&
        <Box justifyContent="Center" alignItems="Center" gap="200">
          <Text align="Center" style={{ color: color.Critical.Main }} size="T300">
            {err}
          </Text>
        </Box>
      }
      {!account && <ConnectButton />}
      {token && <TokenLogin token={token} />}
    </>
  );
}
