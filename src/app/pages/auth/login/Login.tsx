import React, { useEffect, useState } from 'react';
import { TokenLogin } from './TokenLogin';
import { ConnectButton, useAccountInfo } from '@particle-network/connectkit';
import { SmartAccount } from '@particle-network/aa';
import { EthereumSepolia } from '@particle-network/chains';
import { Buffer } from 'buffer';

const getNonce = async (address: any) => {
  const add = address.toString().toLowerCase();

  const response = await fetch(`https://auth.matrixai.click/api/v1/get-msg?address=${add}`, {
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
      const response = await fetch(`https://auth.matrixai.click/api/v1/get-jwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1000',
        },
        body: JSON.stringify({ signature: setSignedMessage, msg: msg }),

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
  const [msg, setMsg] = useState<string>('');

  const [signedMessage, setSignedMessage] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const { account, particleProvider } = useAccountInfo();
  const smartAccount = new SmartAccount(particleProvider!, {
    projectId: import.meta.env.VITE_APP_PROJECT_ID as string,
    clientKey: import.meta.env.VITE_APP_CLIENT_KEY as string,
    appId: import.meta.env.VITE_APP_APP_ID as string,
    aaOptions: {
      simple: [{ chainId: EthereumSepolia.id, version: '1.0.0' }]
    }
  });

  useEffect(() => {
    async function LoadToken() {
      const add = await smartAccount.getAddress();
      const msg = await getNonce(add);

      await particleProvider.request({
        method: 'personal_sign',
        params: [`0x${Buffer.from(msg).toString('hex')}`, account],
      });

      setMsg(msg);
      setSignedMessage(signature);
    }

    if (account && particleProvider) {
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
      <ConnectButton />
      {token && <TokenLogin token={token} />}
    </>

  );
}
