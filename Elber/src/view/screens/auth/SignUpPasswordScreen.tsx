import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import { View } from 'react-native'
import CustomText from '../../components/ui/CustomText'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectSignUpInfo } from '../../../store/selectors/signup.selector'
import { setSignUpPassword } from '../../../store/actions/signup.actions'
import useForm from '../../../hooks/auth/useForm'
import Button from '../../components/ui/Button'
import * as validation from '../../../services/validation.service';
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../Elber'
import SecureText from '../../components/ui/SecureText'

type SignUpPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUpPassword'>

const SignUpPasswordScreen = ({navigation}: SignUpPasswordScreenProps) => {
    const {state, dispatch} = useContext(GlobalContext)
    const {password} = selectSignUpInfo(state.signUp)

    const {error, setError} = useForm()

    const handleChange = (text: string) => {
        dispatch(setSignUpPassword(text))
        setError('')
    }

    const handleSubmit = () => {
        if(!validation.validateMandatoryField(password)) {
            setError('El password es obligatorio.');
            return;
        }

        if(!validation.validatePassword(password)) {
            setError('El password debe tener al menos 8 caracteres, incluyendo letras y números.');
            return;
        }

        navigation.navigate('SignUpConfirmPassword')
    }

    return (
        <MainView>
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                <CustomText type="title" text="Invéntate un password bien machín" style={{marginTop: 20, marginBottom: 20, fontSize: 28}} />
                <SecureText text={password} handleOnChange={handleChange} placeholder='Password' />
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                </View>
                <Button type='primary' title="Continuar" onPress={handleSubmit} style={{marginTop: 48}}/>
            </View>        
        </MainView>
    )
}

export default SignUpPasswordScreen