import React, { useContext, useState } from 'react'
import MainView from '../../components/ui/MainView'
import Button from '../../components/ui/Button'
import { logOut } from '../../../services/auth.service'
import { GlobalContext } from '../../../store/GlobalProvider'
import { Image, View, ScrollView, Pressable, Linking } from 'react-native'
import CustomText from '../../components/ui/CustomText'
import { selectUserProfile } from '../../../store/selectors/user.selector'
import settingsStyle from '../../../styles/settings.style'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import AppIcon from '../../components/ui/AppIcon'
import { showAlert } from '../../../store/actions/elber.actions'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SettingsStackParamList } from './SettingsNavigator'
import Spinner from '../../components/ui/Spinner'

type SettingsProps = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

const SettingsScreen = ({navigation}: SettingsProps) => {
    const {state, dispatch} = useContext(GlobalContext)
    const {name, email} = selectUserProfile(state.user)
    const menuNav = useNavigation()
    const [isProcessing, setIsProcessing] = useState(false)

    const showMenu = () => {
        menuNav.dispatch(DrawerActions.toggleDrawer)
    }

    const sendEmail = async () => {
        const url = 'mailto:martin@namart.tech?subject=Soporte%20Elber'
        const supported = await Linking.canOpenURL(url)
        if (supported) {
            await Linking.openURL(url)
        } else {
            handleAlert('Continuar', 'Error', 'No se pudo abrir la aplicación de correo. Contacta a: martin@namart.tech')
        }
    }

    const handleAlert = (btnText: string, title: string, text: string, action?: () => void) => {
        dispatch(showAlert({
            btnText, 
            title, 
            text,
            isVisible: true,
            onPress: () => {
                if(action) {
                    action()
                }
            }
        }))
    }

    const renderSettingItem = (icon: string, title: string, subtitle?: string,  onPress?: () => void, rightComponent?: React.ReactNode, split?: boolean) => (
        <Pressable 
            style={({pressed}) => ([
                settingsStyle.settingItem,
                { opacity: pressed ? 0.8 : 1 },
                split ? { borderBottomWidth: 1 } : {}
            ])}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={settingsStyle.settingItemLeft}>
                <View style={settingsStyle.iconContainer}>
                    <AppIcon name={icon} size={24} color='#fff' />
                </View>
                <View style={settingsStyle.settingItemContent}>
                    <CustomText type='subtitle' text={title} style={settingsStyle.settingTitle} />
                    {subtitle && <CustomText type='text' text={subtitle} style={settingsStyle.settingSubtitle} />}
                </View>
            </View>
            {rightComponent || <AppIcon name='chevron-forward-outline' size={20} color='#A0A0A0' />}
        </Pressable>
    )

    const renderSectionHeader = (title: string) => (
        <View style={settingsStyle.sectionHeader}>
            <CustomText type='text' text={title} style={settingsStyle.sectionTitle} />
        </View>
    )

    return (
        <MainView navBarTitle='Ajustes' leftAction={showMenu} leftIcon='menu-outline'>
            <ScrollView style={settingsStyle.container} showsVerticalScrollIndicator={false}>
                {/* Sección del Perfil */}
                <View style={settingsStyle.profileSection}>
                    <View style={settingsStyle.logoContainer}>
                        <Image 
                            source={require('../../../assets/images/elber.png')}
                            style={settingsStyle.logo}
                            resizeMode='contain'
                        />
                    </View>
                    <CustomText type='title' text={name} style={settingsStyle.profileName} />
                    <CustomText type='subtitle' text={email} style={settingsStyle.profileEmail} />
                </View>

                {/* Configuración de Cuenta */}
                {renderSectionHeader('Cuenta')}
                <View style={settingsStyle.section}>
                    {renderSettingItem(
                        'person-outline',
                        'Perfil',
                        'Consulta tu información personal',
                        () => navigation.navigate('ProfileSettings')
                    )}
                </View>

                {/* Información y Soporte */}
                {renderSectionHeader('Información')}
                <View style={settingsStyle.section}>
                    {renderSettingItem(
                        'information-circle-outline',
                        'Acerca de',
                        'Información de la aplicación',
                        () => handleAlert('Continuar', 'Acerca de Elber', 'Elber v3.0.0'),
                        undefined,
                        true
                    )}
                    {renderSettingItem(
                        'help-circle-outline',
                        'Ayuda y Soporte',
                        'Obtén ayuda y contacto',
                        () => handleAlert('Contactar', 'Ayuda', 'Contacta con soporte: martin@namart.tech', sendEmail),
                        undefined,
                        true
                    )}
                    {renderSettingItem(
                        'wifi-outline',
                        'Servicios',
                        'Monitoreo de servicios',
                        () => navigation.navigate('EndpointsSettings')
                    )}
                </View>

                <View style={settingsStyle.logoutSection}>
                    {isProcessing ? <Spinner />
                        :
                        <Button 
                            type='primary' 
                            title='Cerrar Sesión' 
                            onPress={() => {
                                handleAlert('Cerrar Sesión', 'Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', 
                                    () => {
                                        setIsProcessing(true)
                                        logOut(dispatch)
                                    }
                                )
                            }}
                        />
                    }
                </View>
            </ScrollView>
        </MainView>
    )
}

export default SettingsScreen