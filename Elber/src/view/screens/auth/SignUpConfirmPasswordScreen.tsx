import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import { TextInput, View } from 'react-native'
import CustomText from '../../components/ui/CustomText'
import inputStyles from '../../../styles/inputs.style'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectSignUpInfo } from '../../../store/selectors/signup.selector'
import { appColors } from '../../../styles/main.style'
import { setSignUpConfirmPassword } from '../../../store/actions/signup.actions'
import useForm from '../../../hooks/auth/useForm'
import Button from '../../components/ui/Button'
import * as validation from '../../../services/validation.service';
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../Elber'
import { signUp } from '../../../services/auth.service'
import Spinner from '../../components/ui/Spinner'

type SignUpConfirmPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUpConfirmPassword'>

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
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
                <CustomText type="title" text="Confirma tu password" style={{marginTop: 20, marginBottom: 20}} />
                <TextInput
                    style={[inputStyles.text]}
                    value={confirmPassword}
                    onChangeText={handleChange}
                    keyboardType='default'
                    autoCapitalize='none'
                    placeholder='Password'
                    placeholderTextColor={appColors.subtitle}
                    secureTextEntry={true}
                />
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                </View>                
                {isProcessing ? <Spinner /> :  <Button type='primary' title="Crear cuenta" onPress={handleSubmit} style={{marginTop: 48}}/>}
            </View>        
        </MainView>
    )
}

export default SignUpConfirmPasswordScreen