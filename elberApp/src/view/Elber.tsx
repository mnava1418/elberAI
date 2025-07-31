import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import AuthMainScreen from './screens/auth/AuthMainScreen';
import LoginScreen from './screens/auth/LoginScreen';

export type RootStackParamList = {
  AuthMain: undefined;
  Login: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const Elber = () => {
    return (
        <Stack.Navigator initialRouteName="AuthMain">
            <Stack.Screen name="AuthMain" component={AuthMainScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );  
}

export default Elber