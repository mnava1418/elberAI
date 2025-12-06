import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import Button from '../../components/ui/Button'
import { logOut } from '../../../services/auth.service'
import { GlobalContext } from '../../../store/GlobalProvider'
import { Image, View } from 'react-native'
import { appColors } from '../../../styles/main.style'
import CustomText from '../../components/ui/CustomText'
import { selectUserProfile } from '../../../store/selectors/user.selector'

const SettingsScreen = () => {
    const {state, dispatch} = useContext(GlobalContext)
    const {name, email} = selectUserProfile(state.user)

    return (
        <MainView navBarTitle='  Settings'>
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{backgroundColor: appColors.secondary, borderRadius: 100, marginTop: 32, marginBottom: 12}}>
                    <Image 
                        source={require('../../../assets/images/elber.png')}
                        style={{height: 120, width: 120, margin: 8}}
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