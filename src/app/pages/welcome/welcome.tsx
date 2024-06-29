import { Box, Button, Text } from 'folds'
import React, { useState } from 'react'
import { useNavigate, } from 'react-router-dom';
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
import RawIcon from '../../atoms/system-icons/RawIcon';


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
                    <Box direction='Row' gap="500" alignItems='Center' >
                        <RawIcon color="var(--tc-surface-high)" size="small" src={LightMode} />
                        <Toggle
                            disabled={settings.getUseSystemTheme()}
                            isActive={themeIndex === 2}
                            onToggle={() => { settings.setTheme(themeIndex === 2 ? 0 : 2); updateState({}); }} />
                        <RawIcon color="var(--tc-surface-high)" size="small" src={DarkMode} />
                    </Box>
                </Box>
                <Box className={css.Content} direction='Column'>
                    <Box className={css.ContentMain} direction='Column' alignItems='Center' gap='600'>
                        <Text size="H3" priority="500" className={css.SubHeader}>Ubiw.space</Text>
                        <Text size='D400' className={css.MainHeader}>Wallet-to-Wallets</Text>
                        <Text size='H1' className={css.SubHeader}>
                            Connect with everyone</Text>
                        <Box direction='Row' gap='600'>
                            <Button size="500" onClick={() => LaunchApp()} >
                                <Text size='H5'>
                                    Launch App
                                </Text>
                                <RawIcon color="var(--bg-surface)" size="normal" src={ArrowIC} />
                            </Button>
                            <Button variant="Secondary" size="500" onClick={() => LaunchApp()} >
                                <Text size='H5'>
                                    Source code
                                </Text>
                                <RawIcon color="var(--bg-surface)" size="normal" src={GitHub} />
                            </Button>
                        </Box>

                    </Box>
                    <Box direction='Column' gap='400'>
                        <Box direction='Row' gap='400'>
                            <Box direction='Column' className={css.FlexItem} gap="200" >
                                <RawIcon src={SpaceIC} />
                                <Text size='H5'>
                                    Rooms / Space
                                </Text>
                                <Text>
                                    Users can create/join a Space and many private rooms in that. Sharing unlimited contents.
                                </Text>
                            </Box>
                            <Box direction='Column' className={css.FlexItem} gap="200">
                                <RawIcon src={EthIC} />
                                <Text size='H5'>
                                    Earn Money with Sepolia
                                </Text>
                                <Text>
                                    Users can earn money by creating a community on the blockchain-based Sepolia network.
                                </Text>
                            </Box>
                            <Box direction='Column' className={css.FlexItem} gap="200">
                                <RawIcon src={NoFinancialIC} />
                                <Text size='H5'>
                                    No Traditional Financial Institutions
                                </Text>
                                <Text>
                                    All transactions are decentralized, bypassing traditional financial institutions for greater privacy and security.
                                </Text>
                            </Box>
                            <Box direction='Column' className={css.FlexItem} gap="200">
                                <RawIcon src={ShareIC} />
                                <Text size='H5'>
                                    Use  with Any Account
                                </Text>
                                <Text>
                                    The platform supports various web3/web2 accounts, allowing easy connection.
                                </Text>
                            </Box>
                        </Box>
                        <Box direction='Row' gap='400'>
                            <Box direction='Column' className={css.FlexItem} gap="200" >
                                <RawIcon src={RealtimeIC} />
                                <Text size='H5'>
                                    Real-Time Messaging
                                </Text>
                                <Text>
                                    Users can send messages and share content instantly and without limits, feel free to use.
                                </Text>
                            </Box>
                            <Box direction='Column' className={css.FlexItem} gap="200">
                                <RawIcon src={AAIC} />

                                <Text size='H5'>
                                    Account Abstraction
                                </Text>
                                <Text>
                                    Provides a user-friendly bridge between traditional web2 interfaces and the decentralized web3 environment.
                                </Text>
                            </Box>
                            <Box direction='Column' className={css.FlexItem} gap="200">
                                <RawIcon src={WalletIC} />

                                <Text size='H5'>
                                    Integrated web3 wallet
                                </Text>
                                <Text>
                                    Use Web3 wallet features right within the platform with.
                                </Text>
                            </Box>
                            <Box direction='Column' className={css.FlexItem} gap="200">
                                <RawIcon src={PeopleIC} />
                                <Text size='H5'>
                                    Easy to use
                                </Text>
                                <Text>
                                    Our platform provide friendly UI and easy to use UX for Users.
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box >
    )
}

export default Welcome