import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { Button, Text, View } from 'react-native';
import { RootStackParamList } from '../../Elber';

type  AuthMainScreenProps = NativeStackScreenProps<RootStackParamList, 'AuthMain'>;

const AuthMainScreen = ({navigation}: AuthMainScreenProps) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Pantalla Principal de Auth</Text>
            <Button
                title="Ir a la pantalla de Login"
                onPress={() => navigation.navigate('Login')}
            />
        </View>
    );
}

export default AuthMainScreen