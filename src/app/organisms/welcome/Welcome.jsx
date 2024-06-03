import React from 'react';
import './Welcome.scss';

import Text from '../../atoms/text/Text';

import CinnySvg from '../../../../public/res/svg/cinny.svg';

function Welcome() {
  return (
    <div className="app-welcome flex--center">
      <div>
        <img className="app-welcome__logo noselect" src={CinnySvg} alt="Cinny logo" />
        <Text className="app-welcome__heading" variant="h1" weight="medium" primary>UBiW.space</Text>
        <Text className="app-welcome__subheading" variant="s1">Platform base on Cinny</Text>
      </div>
    </div>
  );
}

export default Welcome;
