import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import { AuthStackParamList } from '../../Elber';
import CustomText from '../../components/ui/CustomText';
import { appColors } from '../../../styles/main.style';
import Button from '../../components/ui/Button';
import authStyles from '../../../styles/auth.style';
import inputStyles from '../../../styles/inputs.style';
import * as validation from '../../../services/validation.service';
import Spinner from '../../components/ui/Spinner';
import MainView from '../../components/ui/MainView';
import useForm from '../../../hooks/auth/useForm';
import { requestAccess } from '../../../services/auth.service';
import { GlobalContext } from '../../../store/GlobalProvider';
import { setSignUpEmail } from '../../../store/actions/signup.actions';
import { selectSignUpInfo } from '../../../store/selectors/signup.selector';

type  RequestAccessScreenProps = NativeStackScreenProps<AuthStackParamList, 'RequestAccess'>;

const RequestAccessScreen = ({navigation}: RequestAccessScreenProps) => {
    const {state, dispatch} = useContext(GlobalContext)
    const { email } = selectSignUpInfo(state.signUp)

    const {
        error, setError,
        message, setMessage,
        isProcessing, setIsProcessing,
        cleanTexts
    } = useForm();

    const handleRequestAccess = () => {
        if(!validation.validateMandatoryField(email)) {
            setError('El email es obligatorio.');
            return;
        } else if (!validation.validateEmail(email)) {
            setError('El email no es válido.');
            return;
        }

        setIsProcessing(true);
        cleanTexts();
        
        requestAccess(email)
        .then((message) => {
            setMessage(message);
        })
        .catch((error) => {
            setError(error.message);
        })
        .finally(() => {
            setIsProcessing(false);
        });
    };

    const handleEmailChange = (text: string) => {        
        dispatch(setSignUpEmail(text))
        cleanTexts();
    }

    const handleContinue = () => {
        if(!validation.validateMandatoryField(email)) {
            setError('Campo obligatorio.');
            return;
        } else if (!validation.validateEmail(email)) {
            setError('Email no válido.');
            return;
        }
        cleanTexts();
        navigation.navigate('AccessCode')
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
                    onPress={handleContinue}
                    textColor={appColors.subtitle}
                />
            </View>
            </>
        )
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
                        <CustomText type="title" text="Primero tu correo pa' mandarte el chisme" style={{marginTop: 20, marginBottom: 20, fontSize: 28}} />
                        <View style={inputStyles.inputView}>
                            <TextInput
                                style={[inputStyles.text]}
                                value={email}
                                onChangeText={handleEmailChange}
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
                            {isProcessing ? <Spinner /> :  getActionsView()}
                        </View>
                    </View>        
                </ScrollView>
            </KeyboardAvoidingView>
        </MainView>
    );
}

export default RequestAccessScreen