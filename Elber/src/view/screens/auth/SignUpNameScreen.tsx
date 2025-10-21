import React, { useContext } from 'react'
import { View, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import inputStyles from '../../../styles/inputs.style'
import { appColors } from '../../../styles/main.style'
import CustomText from '../../components/ui/CustomText'
import MainView from '../../components/ui/MainView'
import Button from '../../components/ui/Button'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectSignUpInfo } from '../../../store/selectors/signup.selector'
import useForm from '../../../hooks/auth/useForm'
import * as validation from '../../../services/validation.service';
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../Elber'
import { setSignUpName } from '../../../store/actions/signup.actions'
import authStyles from '../../../styles/auth.style'

type SignUpNameScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUpName'>

const SignUpNameScreen = ({navigation}: SignUpNameScreenProps) => {
    const {state, dispatch} = useContext(GlobalContext)
    const {name} = selectSignUpInfo(state.signUp)

    const {
        error, setError,      
    } = useForm()

    const handleChange = (text: string) => {
        dispatch(setSignUpName(text))
        setError('')
    }

    const handleSubmit = () => {
        if(!validation.validateMandatoryField(name)) {
            setError('El nombre es obligatorio.');
            return;
        }

        navigation.navigate('SignUpPassword')
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
                        <CustomText type="title" text="¿Cómo te dicen en tu casa, carnal?" style={{marginTop: 20, marginBottom: 20, fontSize: 28}} />
                        <View style={inputStyles.inputView}>
                            <TextInput
                                style={[inputStyles.text]}
                                value={name}
                                onChangeText={handleChange}
                                keyboardType='default'
                                autoCapitalize='words'
                                placeholder='Nombre'
                                placeholderTextColor={appColors.subtitle}
                                maxLength={30}
                            />
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                            {error !== '' ? <CustomText type='error' text={error} style={{marginTop: 12, textAlign: 'center'}}/> : <></>}
                        </View>
                        <Button type='primary' title="Continuar" onPress={handleSubmit} style={{marginTop: 48}}/>
                    </View>        
                    </ScrollView>
                </KeyboardAvoidingView>
        </MainView>
    )
}

export default SignUpNameScreen