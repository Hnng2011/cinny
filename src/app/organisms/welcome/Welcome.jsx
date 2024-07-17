import React from 'react';
import './Welcome.scss';

import Text from '../../atoms/text/Text';

import UbiwJPG from '../../../../public/logo.jpg';

function Welcome() {
  return (
    <div className="app-welcome flex--center">
      <div>
        <img className="app-welcome__logo noselect" src={UbiwJPG} alt="Ubiw.space logo" />
        <Text className="app-welcome__heading" variant="h1" weight="medium" primary>Ubiw.space</Text>
        <Text className="app-welcome__subheading" variant="s1">Unlimited sharing content platform</Text>
      </div>
    </div>
  );
}

export default Welcome;
