import React, { useContext, useState } from 'react'
import MainView from '../../components/ui/MainView'
import { View } from 'react-native'
import CustomText from '../../components/ui/CustomText'
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner'
import { RootStackParamList } from '../../Elber'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as validation from '../../../services/validation.service';
import { validateAccessCode } from '../../../services/auth.service'
import useForm from '../../../hooks/auth/useForm'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectSignUpInfo } from '../../../store/selectors/signup.selector'
import SecureText from '../../components/ui/SecureText'

type AccessCodeScreenProps = NativeStackScreenProps<RootStackParamList, 'AccessCode'>

const AccessCodeScreen = ({navigation}: AccessCodeScreenProps) => {
    const { state } = useContext(GlobalContext)
    const { email } = selectSignUpInfo(state.signUp)
    const [accessCode, setAccessCode] = useState('')    

    const {
        error, setError,
        isProcessing, setIsProcessing
    } = useForm()
    
    const handleCodeChange = (code: string) => {
        const numericCode = code.replace(/[^0-9]/g, '');
        setAccessCode(numericCode)
        setError('')
    }

    const handleValidateCode = () => {
        if(!validation.validateMandatoryField(accessCode)) {
            setError('El código es obligatorio.');
            return;
        } else if (!validation.validateLength(accessCode, 6) || !validation) {
            setError('El código no es válido.');
            return;
        }

        setIsProcessing(true);
        setError('');

        validateAccessCode(email, accessCode)
        .then((response) => {
            if (response.isValid) {
                navigation.navigate('SignUpName');
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
                <CustomText type="title" text="Échame el código" style={{marginTop: 20, marginBottom: 20, fontSize: 28}} />
                <SecureText text={accessCode} handleOnChange={handleCodeChange} placeholder='123456' keyboardType='number-pad' />                
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                </View>
                {isProcessing ? <Spinner /> :  <Button type='primary' title="Validar código" onPress={handleValidateCode} style={{marginTop: 48}}/>}
            </View>        
        </MainView>
    )
}

export default AccessCodeScreen