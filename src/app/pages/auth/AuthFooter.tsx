import React from 'react';
import { Box, Text } from 'folds';
import * as css from './styles.css';

export function AuthFooter() {
  return (
    <Box className={css.AuthFooter} justifyContent="Center" gap="400" wrap="Wrap">
      <Text as="a" size="T300" href="https://github.com/ubiwdotspace" target="_blank" rel="noreferrer">
        Github
      </Text>
      <Text as="a" size="T300" href="https://cinny.in" target="_blank" rel="noreferrer">
        Base on Cinny
      </Text>
      <Text as="a" size="T300" href="https://matrix.org" target="_blank" rel="noreferrer">
        Powered by Matrix
      </Text>
    </Box>
  );
}
