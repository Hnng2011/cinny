/* eslint-disable import/first */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { enableMapSet } from 'immer';
import '@fontsource/inter/variable.css';
import 'folds/dist/style.css';
import { configClass, varsClass } from 'folds';
import('buffer').then(({ Buffer }) => {
  window.Buffer = Buffer;
});

enableMapSet();

import './index.scss';

import settings from './client/state/settings';

import App from './app/pages/App';

document.body.classList.add(configClass, varsClass);
settings.applyTheme();

const mountApp = () => {
  const rootContainer = document.getElementById('root');

  if (rootContainer === null) {
    return;
  }

  const root = createRoot(rootContainer);
  root.render(<App />);
};

mountApp();
