import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectSignUpInfo } from '../../../store/selectors/signup.selector'
import { View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../Elber'
import CustomText from '../../components/ui/CustomText'
import Button from '../../components/ui/Button'

type SignUpWelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUpWelcome'>

const SignUpWelcomeScreen = ({navigation}: SignUpWelcomeScreenProps) => {
    const {state} = useContext(GlobalContext)
    const {name} = selectSignUpInfo(state.signUp)
    
    return (
        <MainView>
             <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{marginBottom: 24}}>
                    <CustomText type="title" text={`¡Bienvenido, ${name}!`} style={{textAlign: 'center'}} />
                </View>
                <CustomText 
                    type="subtitle" 
                    text='Ya estás registrado. Échale un ojo al mensajito que te mandamos y regresa conmigo para iniciar sesión. ¡Te veo pronto!' 
                    style={{textAlign: 'center'}}
                />
                <Button type='primary' title="Iniciar sesión" onPress={() => {navigation.reset({index: 0, routes: [{name: 'AuthMain'}]})}} style={{marginTop: 32}}/>
            </View>    
        </MainView>
    )
}

export default SignUpWelcomeScreen