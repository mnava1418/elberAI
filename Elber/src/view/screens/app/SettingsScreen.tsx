import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import Button from '../../components/ui/Button'
import { logOut } from '../../../services/auth.service'
import { GlobalContext } from '../../../store/GlobalProvider'
import { Image, View } from 'react-native'
import CustomText from '../../components/ui/CustomText'
import { selectUserProfile } from '../../../store/selectors/user.selector'
import settingsStyle from '../../../styles/settings.style'
import { DrawerActions, useNavigation } from '@react-navigation/native'

const SettingsScreen = () => {
    const {state, dispatch} = useContext(GlobalContext)
    const {name, email} = selectUserProfile(state.user)
    const navigation = useNavigation()

    const showMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer)
    }

    return (
        <MainView navBarTitle='Ajustes' leftAction={showMenu} leftIcon='menu-outline'>
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={settingsStyle.logoContainer}>
                    <Image 
                        source={require('../../../assets/images/elber.png')}
                        style={settingsStyle.logo}
                        resizeMode='contain'
                    />
                </View>
                <CustomText type='title' text={name} />
                <CustomText type='subtitle' text={email} />
                <Button type='primary' title='Salir' onPress={() => {logOut(dispatch)}} />
            </View>
        </MainView>
    )
}

export default SettingsScreen