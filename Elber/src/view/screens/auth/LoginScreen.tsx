import React, { useState } from 'react';
import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import MainView from '../../components/ui/MainView';
import authStyles from '../../../styles/auth.style';
import inputStyles from '../../../styles/inputs.style';
import CustomText from '../../components/ui/CustomText';
import { appColors } from '../../../styles/main.style';
import SecureText from '../../components/ui/SecureText';
import Button from '../../components/ui/Button';
import useForm from '../../../hooks/auth/useForm';
import Spinner from '../../components/ui/Spinner';
import * as validation from '../../../services/validation.service';
import { signIn } from '../../../services/auth.service';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../Elber';

type  LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({navigation}: LoginScreenProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {
        isProcessing, setIsProcessing,
        error, setError
    } = useForm()

    const handleEmail = (text: string) => {
        setError('')
        setEmail(text)
    }

    const handlePassword = (text: string) => {
        setError('')
        setPassword(text)
    }
    
    const handleLogin = async () => {
        if(!validation.validateMandatoryField(email) || !validation.validateMandatoryField(password)) {
            setError('Email y Password son obligatorios.')
            return
        } else if(!validation.validateEmail(email)) {
            setError('Email no válido.');
            return
        }

        setError('')
        setIsProcessing(true)
        
        signIn(email, password)        
        .catch((error) => {            
            setError(error.message);
        })
        .finally(() => {
            setIsProcessing(false);
        });
    };

    const getActionsView = () => {
        return (
            <>
            <Button type='primary' title="Iniciar Sesión" onPress={handleLogin} style={{marginTop: 40}}/>
            <View style={authStyles.footer}>
                <Button 
                    type="secondary"
                    title="¿Olvidaste tu password?"
                    onPress={() => {navigation.navigate('RecoverPassword', {email})}}
                    textColor={appColors.text}
                />
            </View>
            </>
        )
    }

    return (
        <MainView navigation={navigation}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={authStyles.scrollContainer}
                    keyboardShouldPersistTaps="handled">
                    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                        <CustomText type="title" text="Hola, que gusto verte de nuevo." style={{marginTop: 20, marginBottom: 20, fontSize: 28}} />                        
                        <View style={inputStyles.inputView}>
                            <TextInput
                                style={[inputStyles.text]}
                                value={email}
                                onChangeText={handleEmail}
                                keyboardType='email-address'
                                autoCapitalize='none'
                                placeholder='Email'
                                placeholderTextColor={appColors.subtitle}
                            />
                        </View>
                        <View style={{marginTop: 20}}>
                            <SecureText text={password} placeholder='Password' handleOnChange={handlePassword} />
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                            {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}                            
                        </View>
                        <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                            {isProcessing ? <Spinner /> :  getActionsView()}                        
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </MainView>
    );
};

export default LoginScreen;