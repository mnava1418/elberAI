import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import AuthMainScreen from './screens/auth/AuthMainScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignUpScreen from './screens/auth/SignUpScreen';

export type RootStackParamList = {
  AuthMain: undefined;
  Login: undefined;
  SignUp: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const Elber = () => {
    return (
        <Stack.Navigator initialRouteName="AuthMain">
            <Stack.Screen 
            name="AuthMain" component={AuthMainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );  
}

export default Elber