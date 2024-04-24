import React, { useState } from 'react';

import '@particle-network/connectkit/dist/index.css';

import ConnectKitDemo from './connectKitDemo';


export function Login() {
  const [token, setToken] = useState<string | null>(null);
  return (
    <ConnectKitDemo />
  );
}
