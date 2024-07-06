import { Box, Button, Text } from 'folds'
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import * as css from './styles.css';
import { APP_PATH } from '../paths';
import Toggle from '../../atoms/button/Toggle';
import settings from '../../../client/state/settings';
import ArrowIC from '../../../../public/res/ic/filled/right-arrow.svg'
import GitHub from '../../../../public/res/ic/filled/github.svg'
import LightMode from '../../../../public/res/ic/filled/light-mode.svg'
import DarkMode from '../../../../public/res/ic/filled/dark-mode.svg'
import SpaceIC from '../../../../public/res/ic/outlined/space.svg'
import EthIC from '../../../../public/res/ic/outlined/eth.svg'
import NoFinancialIC from '../../../../public/res/ic/outlined/no-financial.svg'
import WalletIC from '../../../../public/res/ic/outlined/wallet.svg'
import AAIC from '../../../../public/res/ic/outlined/aa.svg'
import RealtimeIC from '../../../../public/res/ic/outlined/realtime.svg'
import PeopleIC from '../../../../public/res/ic/outlined/many-people.svg'
import ShareIC from '../../../../public/res/ic/outlined/share.svg'
import XIC from '../../../../public/res/ic/outlined/x.svg';
import RawIcon from '../../atoms/system-icons/RawIcon';


const describes = [
    {
        icon: SpaceIC,
        head: 'Rooms / Space',
        body: 'Users can create/join a Space and many private rooms in that. Sharing unlimited contents.'
    },
    {
        icon: EthIC,
        head: 'Earn Money on Sepolia',
        body: 'Users can earn money by creating a community on the blockchain-based Sepolia network.'
    },
    {
        icon: NoFinancialIC,
        head: 'ZK Email',
        body: 'Verify your Twitter without access privacy information, just email.'
    },
    {
        icon: ShareIC,
        head: 'Use  with Any Account',
        body: 'The platform supports various web3/web2 accounts, allowing easy connection.'
    },
    {
        icon: RealtimeIC,
        head: 'Real-Time Sharing',
        body: 'Users can share content instantly and without limits, feel free to use.'
    },
    {
        icon: AAIC,
        head: 'Account Abstraction',
        body: 'Provides a user-friendly bridge between traditional web2 and the decentralized web3.'
    },
    {
        icon: WalletIC,
        head: 'Integrated web3 wallet',
        body: 'Our platform provide friendly UI and easy to use UX for Users.'
    },
    {
        icon: PeopleIC,
        head: 'Easy to use',
        body: 'Provides a user-friendly bridge between traditional web2 and the decentralized web3.'
    }
]

function Welcome() {
    const [, updateState] = useState({});
    const themeIndex = settings.getThemeIndex()
    const navigate = useNavigate()

    function LaunchApp() {
        navigate(APP_PATH, { replace: true })
    }

    return (
        <Box className={css.Welcome}>
            <Box className={css.Background} />
            <Box className={css.Container} direction='Column'>
                <Box className={css.Navigation} direction='Row' justifyContent='End' alignItems='Center'>
                    {!settings.getUseSystemTheme() &&
                        <Box direction='Row' gap="500" alignItems='Center' >
                            <RawIcon color="var(--tc-surface-high)" size="small" src={LightMode} />
                            <Toggle
                                disabled={settings.getUseSystemTheme()}
                                isActive={themeIndex === 2}
                                onToggle={() => { settings.setTheme(themeIndex === 2 ? 0 : 2); updateState({}); }} />
                            <RawIcon color="var(--tc-surface-high)" size="small" src={DarkMode} />
                        </Box>
                    }
                </Box>
                <Box className={css.Content} direction='Column'>
                    <Box className={css.ContentMain} direction='Column' alignItems='Center' gap='600'>
                        <Text size="H3" priority="500" className={css.SubHeader}>Ubiw.space</Text>
                        <Text size='D400' className={css.MainHeader}>Wallet-to-Wallets</Text>
                        <Text size='H1' className={css.SubHeader}>
                            Connect with everyone</Text>
                        <Box direction='Row' gap='600' wrap='Wrap' justifyContent='Center'>
                            <Link style={{ flexBasis: '2' }} to="https://proof.ubiw.space" target="_blank">
                                <Button variant="Warning" size="500" onClick={() => (null)}>
                                    <Text size='H6'>
                                        Prove Twitter account
                                    </Text>
                                    <RawIcon color="var(--bg-surface)" size="small" src={XIC} />
                                </Button>
                            </Link>
                            <Button style={{ flexBasis: '1' }} size="500" onClick={() => LaunchApp()} >
                                <Text size='H6'>
                                    Launch App
                                </Text>
                                <RawIcon color="var(--bg-surface)" size="small" src={ArrowIC} />
                            </Button>
                            <Link style={{ flexBasis: '1' }} to="https://github.com/ubiwdotspace" target="_blank">
                                <Button variant="Secondary" size="500" onClick={() => (null)}>
                                    <Text size='H6'>
                                        Github
                                    </Text>
                                    <RawIcon color="var(--bg-surface)" size="small" src={GitHub} />
                                </Button>
                            </Link>
                        </Box>
                    </Box>
                    <Box direction='Column' gap='400' className={css.Grid}>
                        {
                            describes.map((item, index) =>
                                <Box key={index} direction='Column' className={css.FlexItems} gap="200" >
                                    <RawIcon src={item.icon} />
                                    <Text size='H5'>
                                        {item.head}
                                    </Text>
                                    <Text>
                                        {item.body}
                                    </Text>
                                </Box>)
                        }

                    </Box>
                    <Box direction='Column' className='FAQHeader'>
                        <Text align='Center' size='H2' className={css.MainHeader2}>Frequently Asked Questions</Text>
                        <Text align='Center' size='H4' className={css.SubHeader2}>something you need to know</Text>
                    </Box>
                    <Box direction='Column' className={css.FAQContent} alignItems='Start'>
                        <Text align='Left' size='H4' className={css.Question}>What is Ubiw.space ?</Text>
                        <Text align='Left' size='H6' className={css.Answer}>Ubiw.space is a platform that <Link to="https://github.com/ubiwdotspace" target="_blank"><span style={{ color: 'var(--bg-primary)' }}>made by Ubiwdotspace team</span></Link>. Everyone can create a space and in that, the owner can create any rooms for any content they want or think for earning money.</Text>
                        <Box className={css.Divider} alignItems='Start' />
                        <Text align='Left' size='H4' className={css.Question}>What is ZKEmail and why we use it ?</Text>
                        <Text align='Left' size='H6' className={css.Answer}>ZK Email is a library that allows for anonymous verification of email signatures while masking specific data.<br /><br />We use ZK Email to verify your Twitter account for keeping your security and privacy. Freely to share content on our platform.</Text>
                        <Box className={css.Divider} alignItems='Start' />
                        <Text align='Left' size='H4' className={css.Question}>Is Ubiw.space free ?</Text>
                        <Text align='Left' size='H6' className={css.Answer}>Yes. Ubiw.space is a free to use platform. Thanks to Account Abstraction you don't have to pay fee to the network. Just pay when join a Creator room</Text>
                        <Button className={css.AllFaqs}> <Box direction='Row' gap='200' alignItems='Center'><Text size='H5'>Check all FAQs </Text><RawIcon color="var(--bg-surface)" size='small' src={ArrowIC} /></Box></Button>
                    </Box>
                </Box>

            </Box>
        </Box >
    )
}

export default Welcome