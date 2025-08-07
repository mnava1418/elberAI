import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { TextInput, View } from 'react-native'
import { RootStackParamList } from '../../Elber';
import CustomText from '../../components/ui/CustomText';
import { appColors } from '../../../styles/main.style';
import Button from '../../components/ui/Button';
import authStyles from '../../../styles/auth.style';
import inputStyles from '../../../styles/inputs.style';
import * as validation from '../../../services/validation.service';
import Spinner from '../../components/ui/Spinner';
import MainView from '../../components/ui/MainView';
import useRequestAccess from '../../../hooks/auth/useRequestAccess';

type  RequestAccessScreenProps = NativeStackScreenProps<RootStackParamList, 'RequestAccess'>;

const RequestAccessScreen = ({navigation}: RequestAccessScreenProps) => {
    const {
        email,
        setEmail,
        error,
        setError,
        message,
        setMessage,
        isProcessing,
        setIsProcessing,
        cleanTexts
    } = useRequestAccess();

    const handleRequestAccess = () => {
        if(!validation.validateMandatoryField(email)) {
            setError('Campo obligatorio.');
            return;
        } else if (!validation.validateEmail(email)) {
            setError('Email no válido.');
            return;
        }

        setIsProcessing(true);
        cleanTexts();
        
        setTimeout(() => {
            setIsProcessing(false);
            setMessage('Solicitud enviada. Revisa tu correo electrónico para más instrucciones.');
        }, 2000);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        cleanTexts();
    }

    const getActionsView = () => {
        return (
            <>
            <Button type='primary' title="Solicitar acceso" onPress={handleRequestAccess} style={{marginTop: 48}}/>
            <View style={authStyles.footer}>
                <CustomText type='text' text='¿Ya tienes tu código?' style={{marginRight: 5}} />
                <Button 
                    type="secondary"
                    title="Continuar"
                    onPress={() => navigation.navigate('Login')}
                    textColor={appColors.subtitle}
                />
            </View>
            </>
        )
    }

    return (
        <MainView>
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
                <CustomText type="title" text="Email" style={{marginTop: 20, marginBottom: 20}} />
                <TextInput
                    style={[inputStyles.text]}
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    placeholder='email@elber.com'
                    placeholderTextColor={appColors.subtitle}
                />
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                    {message !== '' ? <CustomText type='text' text={message} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                </View>
                {isProcessing ? <Spinner /> :  getActionsView()}
            </View>        
        </MainView>
    );
}

export default RequestAccessScreen