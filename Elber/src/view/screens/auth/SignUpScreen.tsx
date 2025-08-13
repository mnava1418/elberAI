import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { View } from 'react-native'
import { RootStackParamList } from '../../Elber';
import CustomText from '../../components/ui/CustomText';
import LinearGradient from 'react-native-linear-gradient';
import { appColors } from '../../../styles/main.style';

type  SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen = ({}: SignUpScreenProps) => {
    return (
        <LinearGradient
            colors={[appColors.primary, appColors.secondary]}
            style={{flex: 1}}
        >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <CustomText type='title' text='Sign Up Screen' />            
        </View>
        </LinearGradient>
    );
}

export default SignUpScreen