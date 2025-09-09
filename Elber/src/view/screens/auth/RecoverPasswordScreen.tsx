import React, { useState } from 'react'
import MainView from '../../components/ui/MainView'
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import authStyles from '../../../styles/auth.style'
import inputStyles from '../../../styles/inputs.style'
import { appColors } from '../../../styles/main.style'
import CustomText from '../../components/ui/CustomText'
import Spinner from '../../components/ui/Spinner'
import useForm from '../../../hooks/auth/useForm'
import * as validation from '../../../services/validation.service';
import Button from '../../components/ui/Button'
import { AuthStackParamList } from '../../Elber'
import { RouteProp, useRoute } from '@react-navigation/native'
import { resetPassword } from '../../../services/auth.service'

const RecoverPasswordScreen = () => {
    const { email } = useRoute<RouteProp<AuthStackParamList, 'RecoverPassword'>>().params
    const [recoverEmail, setRecoverEmail] = useState(email)
    const { 
        error, setError, 
        message, setMessage, 
        isProcessing, setIsProcessing, 
        cleanTexts 
    } = useForm();

    const handleEmail = (text: string) => {
        setRecoverEmail(text)
        cleanTexts()
    }

    const handleRecoverPassword = () => {
        if(!validation.validateMandatoryField(recoverEmail)) {
            setError('Campo obligatorio.');
            return;
        } else if (!validation.validateEmail(recoverEmail)) {
            setError('Email no válido.');
            return;
        }

        setIsProcessing(true);
        cleanTexts();

        resetPassword(recoverEmail)
        .then((message) => {
            setMessage(message);
        })
        .catch((error) => {
            setError(error.message);
        })
        .finally(() => {
            setIsProcessing(false);
        });
    }

    return (
        <MainView>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={authStyles.scrollContainer}
                    keyboardShouldPersistTaps="handled">
                    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                        <CustomText type="title" text="¡No te preocupes! Ahorita recuperamos tu password." style={{marginTop: 20, marginBottom: 20, fontSize: 28}} />                        
                        <View style={inputStyles.inputView}>
                            <TextInput
                                style={[inputStyles.text]}
                                value={recoverEmail}
                                onChangeText={handleEmail}
                                keyboardType='email-address'
                                autoCapitalize='none'
                                placeholder='Email'
                                placeholderTextColor={appColors.subtitle}
                            />
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                            {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                            {message !== '' ? <CustomText type='text' text={message} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                        </View>
                        <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                            {isProcessing ? <Spinner /> : <Button type='primary' title="Recuperar password" onPress={handleRecoverPassword} style={{marginTop: 40}}/> }                        
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </MainView>
    )
}

export default RecoverPasswordScreen