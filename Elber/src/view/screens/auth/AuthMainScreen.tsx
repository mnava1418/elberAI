import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { View } from 'react-native';
import { AuthStackParamList } from '../../Elber';
import { Image } from 'react-native';
import Button from '../../components/ui/Button';
import CustomText from '../../components/ui/CustomText';
import authStyles from '../../../styles/auth.style';
import { appColors } from '../../../styles/main.style';
import { useEffect } from 'react';
import useFadeIn from '../../../hooks/animation/useFadeIn';
import { Animated } from 'react-native';
import useAnimateText from '../../../hooks/animation/useAnimateText';
import MainView from '../../components/ui/MainView';

type  AuthMainScreenProps = NativeStackScreenProps<AuthStackParamList, 'AuthMain'>;

const phrases = [
    "Hola, soy Elber",
    "Tu asistente de IA",
    "Cuenta conmigo",
];

const AuthMainScreen = ({navigation}: AuthMainScreenProps) => {
    
    const {fadeIn,  setFadeIn} = useFadeIn();
    const {animatedElements, setAnimatedText} = useAnimateText(phrases)
    const {interval, displayedText, phrase} = animatedElements
    
    useEffect(() => {
        setFadeIn();
    }, []);

    useEffect(() => {
        setAnimatedText()
        return () => clearInterval(interval);
    }, [phrase]);

    return (
       <MainView showNavBar={false}>
            <Animated.View style={[authStyles.container, { opacity: fadeIn }]}>
                <View style={authStyles.centerContent}>
                    <Image
                        source={require('../../../assets/images/elber.png')}
                        style={authStyles.logo}
                        resizeMode='contain'
                    />
                    <CustomText type='title' text={displayedText} style={{textAlign: 'center', marginHorizontal: 40}}/>
                </View>
                <View style={authStyles.bottomContent}>
                    <Button
                        type="primary"
                        title="Crea tu cuenta"
                        onPress={() => navigation.navigate('RequestAccess')}                        
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
            </Animated.View>
        </MainView>
    );
}

export default AuthMainScreen