import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { Button, Text, View } from 'react-native'
import { RootStackParamList } from '../../Elber';

type  LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({navigation}: LoginScreenProps) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Pantalla de Login</Text>
            <Button
                title="Regresar a la pantalla principal de Auth"
                onPress={() => navigation.navigate('AuthMain')}
            />
        </View>
    );
}

export default LoginScreen