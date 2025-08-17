import React from 'react'
import MainView from '../../components/ui/MainView'
import { TextInput, View } from 'react-native'
import inputStyles from '../../../styles/inputs.style'
import { appColors } from '../../../styles/main.style'
import CustomText from '../../components/ui/CustomText'
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner'
import useAccessCode from '../../../hooks/auth/useAccessCode'
import { RootStackParamList } from '../../Elber'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RouteProp, useRoute } from '@react-navigation/native'
import * as validation from '../../../services/validation.service';
import { validateAccessCode } from '../../../services/auth.service'

type AccessCodeScreenProps = NativeStackScreenProps<RootStackParamList, 'AccessCode'>

const AccessCodeScreen = ({navigation}: AccessCodeScreenProps) => {
    const { email } = useRoute<RouteProp<RootStackParamList, 'AccessCode'>>().params
    
    const { 
        accessCode, setAccessCode,
        error, setError,
        isProcessing, setIsProcessing
    } = useAccessCode()

    const handleCodeChange = (code: string) => {
        const numericCode = code.replace(/[^0-9]/g, '');
        setAccessCode(numericCode)
        setError('')
    }

    const handleValidateCode = () => {
        if(!validation.validateMandatoryField(accessCode)) {
            setError('Campo obligatorio.');
            return;
        } else if (!validation.validateLength(accessCode, 6) || !validation) {
            setError('Código no válido.');
            return;
        }

        setIsProcessing(true);
        setError('');

        validateAccessCode(email, accessCode)
        .then((response) => {
            if (response.isValid) {
                navigation.navigate('Login');
            } else {
                setError(response.message);
            }
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
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
                <CustomText type="title" text="Código de Acceso" style={{marginTop: 20, marginBottom: 20}} />
                <TextInput
                    style={[inputStyles.text]}
                    value={accessCode}
                    onChangeText={handleCodeChange}
                    keyboardType='number-pad'
                    autoCapitalize='none'
                    placeholder='123456'
                    placeholderTextColor={appColors.subtitle}
                    maxLength={6}
                />
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                </View>
                {isProcessing ? <Spinner /> :  <Button type='primary' title="Validar código" onPress={handleValidateCode} style={{marginTop: 48}}/>}
            </View>        
        </MainView>
    )
}

export default AccessCodeScreen