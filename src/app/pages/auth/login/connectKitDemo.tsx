import React, { useEffect, useState } from 'react';
import { ConnectButton, useAccountInfo } from '@particle-network/connectkit';
import { SmartAccount } from '@particle-network/aa';
import { EthereumSepolia } from '@particle-network/chains';

import { TokenLogin } from './TokenLogin';


const projectId = import.meta.env.VITE_APP_PROJECT_ID as string;
const clientKey = import.meta.env.VITE_APP_CLIENT_KEY as string;
const appId = import.meta.env.VITE_APP_APP_ID as string;


async function getNonce(address: any, setSignedMessage: any) {
    const add = address.toString().toLowerCase();
    const fetchData = async () => {
        try {
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
            setSignedMessage(data.message);
        } catch (error) {
            console.log('error', error);
        }
    };

    fetchData();
};

async function postNonce(msg: any, setSignedMessage: any) {
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
            localStorage.clear();
            window.location.href = `https://cinny-nine.vercel.app/login/matrixai.click?loginToken=${data.token}`;
        } catch (error) {
            console.log('error', error);
        } finally {
            console.log('Success');
        }
    };

    postData();
};

const ConnectKitDemo = () => {
    const [signedMessage, setSignedMessage] = useState<string>('');
    const { account, particleProvider } = useAccountInfo();
    const smartAccount = new SmartAccount(particleProvider, {
        projectId,
        clientKey,
        appId,
        aaOptions: {
            simple: [{ chainId: EthereumSepolia.id, version: '1.0.0' }]
        }
    });

    useEffect(() => {
        async function LoadMessage() {
            const add = particleProvider && await smartAccount.getAddress();
            account && await getNonce(add, setSignedMessage);
        }

        LoadMessage();
    }, [account])



    // const signMessage = async () => {
    //     if (!signedMessage) {
    //         return;
    //     }
    //     if (!particleProvider) {
    //         throw new Error('Please connect wallet first!');
    //     }
    //     try {
    //         let signature;
    //         const add = await smartAccount.getAddress();
    //         signature = await particleProvider.request({
    //             method: 'personal_sign',
    //             params: [`0x${Buffer.from(signedMessage).toString('hex')}`, account],
    //         });
    //         postNonce(add, signature);
    //         notification.success({
    //             message: 'Sign Success',
    //             description: signature,
    //         });
    //     } catch (error: any) {
    //         notification.error({
    //             message: 'Sign Error',
    //             description: error.message || error,
    //         });
    //     }
    // };

    return (
        <ConnectButton />
    );
};

export default ConnectKitDemo;
