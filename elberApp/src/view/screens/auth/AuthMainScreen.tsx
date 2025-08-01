import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { View } from 'react-native';
import { RootStackParamList } from '../../Elber';
import { Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/ui/Button';
import CustomText from '../../components/ui/CustomText';
import authStyles from '../../../styles/auth.style';
import { appColors } from '../../../styles/main.style';

type  AuthMainScreenProps = NativeStackScreenProps<RootStackParamList, 'AuthMain'>;

const AuthMainScreen = ({navigation}: AuthMainScreenProps) => {
    return (
        <LinearGradient
            colors={[appColors.primary, appColors.secondary]}
            style={{flex: 1}}
        >
            <View style={authStyles.container}>
                <View style={authStyles.centerContent}>
                    <Image
                        source={require('../../../assets/images/dot.png')}
                        style={authStyles.logo}
                    />
                    <CustomText type='title' text='Elber'  />
                    <CustomText type='subtitle' text='Tu asistente de IA para todo' />
                </View>
                <View style={authStyles.bottomContent}>
                    <Button
                        type="primary"
                        title="Crear cuenta"
                        onPress={() => navigation.navigate('SignUp')}                        
                    />
                    <View style={authStyles.footer}>
                        <CustomText type='text' text='¿Ya tienes cuenta?' style={{marginRight: 5}} />
                        <Button 
                            type="secondary"
                            title="Iniciar Sesión"
                            onPress={() => navigation.navigate('Login')}
                            textColor={appColors.subtitle}
                        />
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

export default AuthMainScreen