import React from 'react';
import { useLocation } from 'react-router-dom';
import { TokenLogin } from './TokenLogin';

export function Login() {
  const location = useLocation();
  const token = location.search.replace('?loginToken=', '');
  return (
    <TokenLogin token={token} />
  );
}
