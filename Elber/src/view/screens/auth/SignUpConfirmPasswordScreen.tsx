import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import CustomText from '../../components/ui/CustomText'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectSignUpInfo } from '../../../store/selectors/signup.selector'
import { cleanSignUpPasswords, setSignUpConfirmPassword } from '../../../store/actions/signup.actions'
import useForm from '../../../hooks/auth/useForm'
import Button from '../../components/ui/Button'
import * as validation from '../../../services/validation.service';
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../Elber'
import { signUp } from '../../../services/auth.service'
import Spinner from '../../components/ui/Spinner'
import SecureText from '../../components/ui/SecureText'
import authStyles from '../../../styles/auth.style'

type SignUpConfirmPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUpConfirmPassword'>

const SignUpConfirmPasswordScreen = ({navigation}: SignUpConfirmPasswordScreenProps) => {
    const {state, dispatch} = useContext(GlobalContext)
    const {email, name, password, confirmPassword} = selectSignUpInfo(state.signUp)
    const {
        error, setError,
        isProcessing, setIsProcessing
    } = useForm()

    const handleChange = (text: string) => {
        dispatch(setSignUpConfirmPassword(text))
        setError('')
    }

    const handleSubmit = () => {
        if(!validation.validateMandatoryField(confirmPassword)) {
            setError('El password es obligatorio.');
            return;
        }

        if(!validation.validateConfirmPassword(password, confirmPassword)) {
            setError('Los passwords no coinciden.');
            return;
        }

        setIsProcessing(true);

        signUp(email, password, name)
        .then(result => {
            if (result.registered) {
                dispatch(cleanSignUpPasswords())
                navigation.navigate('SignUpWelcome');
            } else {
                setError(result.message);
            }
        })
        .catch(error => {
            setError(error.message);
        })
        .finally(() => {
            setIsProcessing(false)
        })
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
                        <CustomText type="title" text="Va de nuez, confirma tu password" style={{marginTop: 20, marginBottom: 20, fontSize: 28}} />
                        <SecureText text={confirmPassword} handleOnChange={handleChange} placeholder='Password' />                                
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                            {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                        </View>                
                        <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                            {isProcessing ? <Spinner /> :  <Button type='primary' title="Crear cuenta" onPress={handleSubmit} style={{marginTop: 48}}/>}
                        </View>
                    </View>        
                </ScrollView>
            </KeyboardAvoidingView>
        </MainView>
    )
}

export default SignUpConfirmPasswordScreen