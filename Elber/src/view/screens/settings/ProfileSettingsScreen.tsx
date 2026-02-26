import React, { useContext, useState } from 'react'
import MainView from '../../components/ui/MainView'
import CustomText from '../../components/ui/CustomText'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SettingsStackParamList } from './SettingsNavigator'
import { View } from 'react-native'
import settingsStyle from '../../../styles/settings.style'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectUserProfile } from '../../../store/selectors/user.selector'
import Button from '../../components/ui/Button'
import { showAlert } from '../../../store/actions/elber.actions'
import * as userServices from '../../../services/user.service'
import Spinner from '../../components/ui/Spinner'
import { deleteAllChatsAction } from '../../../store/actions/chat.actions'

type ProfileSettingsProps = NativeStackScreenProps<SettingsStackParamList, 'ProfileSettings'>;

const ProfileSettingsScreen = ({navigation}: ProfileSettingsProps) => {
    const {state, dispatch} = useContext(GlobalContext)
    const {name, email} = selectUserProfile(state.user)

    const [message, setMessage] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    const deleteProfile = () => {
        userServices.deleteProfile()
        .then((response) => {
            setMessage(response)
            dispatch(deleteAllChatsAction());
        })
        .catch(error => {
            setMessage(error.message)
        })
        .finally(() => {
            setIsProcessing(false)
        })
    }

    const confirmDeleteProfile = () => {
        setMessage('')
        dispatch(showAlert({
            btnText: 'Eliminar Perfil', 
            title: 'Eliminar Perfil', 
            text: 'Esta acción eliminará permanentemente tu perfil y todos tus datos. No podrás recuperar tu información una vez eliminada. ¿Estás completamente seguro?',
            isVisible: true,
            onPress: () => {
                setIsProcessing(true)
                deleteProfile()
            }
        }))
    }

    const getResponse = () => {
        return(
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 8}}>
                <CustomText type='text' text={message} />
            </View>
        )
    }

    return (
        <MainView navBarTitle='Perfil' leftAction={() => {navigation.goBack()}}>
            <View style={{marginTop: 24, marginBottom: 8}}>
                <CustomText type='text' text={'Información Personal'} style={settingsStyle.sectionSubTitle} />
            </View>
            <View style={settingsStyle.container}>
                <View style={[settingsStyle.section, {padding: 12}]}>
                    <View style={[settingsStyle.infoRow, {marginBottom: 8}]}>
                        <CustomText text='Nombre: ' style={settingsStyle.infoLabel} type='text' />
                        <CustomText text={name} style={settingsStyle.infoValue} type='text' />
                    </View>
                    
                    <View style={settingsStyle.infoRow}>
                        <CustomText text='Email: ' style={settingsStyle.infoLabel} type='text' />
                        <CustomText text={email} style={settingsStyle.infoValue} type='text' />
                    </View>
                </View>
                {message.length > 0 ? getResponse() : <></>  }
                <View style={settingsStyle.logoutSection}>
                    {isProcessing ? <Spinner /> :  <Button type='primary' title='Eliminar Perfil' onPress={ confirmDeleteProfile } />}
                </View>
            </View>
        </MainView>
    )
}

export default ProfileSettingsScreen