import React, { useContext, useEffect, useState } from 'react'
import MainView from '../../components/ui/MainView'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from './SettingsNavigator';
import { checkEndpoints } from '../../../services/status.service';
import { GlobalContext } from '../../../store/GlobalProvider';
import { showAlert } from '../../../store/actions/elber.actions';
import { EndpointsCheck } from '../../../models/status.model';
import { View } from 'react-native';
import CustomText from '../../components/ui/CustomText';
import settingsStyle from '../../../styles/settings.style';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

type EndpointsSettingsProps = NativeStackScreenProps<SettingsStackParamList, 'EndpointsSettings'>;

const EndpointsSettingsScreen = ({navigation}: EndpointsSettingsProps) => {
    const {dispatch} = useContext(GlobalContext)
    const [isProcessing, setIsProcessing] = useState(true)
    const [serviceStatus, setServiceStatus] = useState<EndpointsCheck[]>([
        {name: 'API Gateway', isAvailable: false},
        {name: 'AI Services', isAvailable: false},
        {name: 'Auth Services', isAvailable: false},
        {name: 'Notification Services', isAvailable: false},
    ])

    const handleCheck = () => {
        setIsProcessing(true)
        checkEndpoints()
        .then((result) => {
            setServiceStatus([...result])
        })
        .catch((error) => {
            dispatch(showAlert({
                btnText: 'Cerrar',
                isVisible: true,
                onPress : () => {},
                text: error.message,
                title: 'Error'
            }))
        })
        .finally(() => {
            setIsProcessing(false)
        })
    }

    useEffect(() => {
        handleCheck()
    }, [])
    
    return (
        <MainView navBarTitle='Servicios' leftAction={() => {navigation.goBack()}}>
            <View style={{marginTop: 24, marginBottom: 8}}>
                <CustomText type='text' text={'Estado de Servicios'} style={settingsStyle.sectionSubTitle} />
            </View>
            <View style={settingsStyle.container}>
                <View style={[settingsStyle.section, {padding: 12}]}>
                    {serviceStatus.map((value, index) => {
                        return(
                            <View key={index} style={[settingsStyle.infoRow, {justifyContent: 'space-between'}]}>
                                <CustomText text={`${value.name}: `} style={settingsStyle.infoLabel} type='text' />
                                <CustomText text={value.isAvailable ? 'On' : 'Off'} style={[settingsStyle.infoValue, {marginRight: 16}]} type='text' />
                            </View>
                        )
                    })}
                </View>
                <View style={settingsStyle.logoutSection}>
                    {isProcessing ? <Spinner /> :  <Button type='primary' title='Checar Servicios' onPress={ handleCheck } />}
                </View>
            </View>
        </MainView>
    )
}

export default EndpointsSettingsScreen