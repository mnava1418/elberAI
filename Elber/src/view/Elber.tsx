import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import AuthMainScreen from './screens/auth/AuthMainScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import RequestAccessScreen from './screens/auth/RequestAccessScreen';
import AccessCodeScreen from './screens/auth/AccessCodeScreen';

export type RootStackParamList = {
  AuthMain: undefined;
  Login: undefined;
  SignUp: undefined;
  RequestAccess: undefined;
  AccessCode: {email: string}
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const Elber = () => {
    return (
        <Stack.Navigator 
            initialRouteName="AuthMain"
            screenOptions={{
                headerStyle: {backgroundColor: '#000'},
                headerTintColor: '#fff',
            }}
        >
            <Stack.Screen name="AuthMain" component={AuthMainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RequestAccess" component={RequestAccessScreen} />
            <Stack.Screen name="AccessCode" component={AccessCodeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />            
        </Stack.Navigator>
    );  
}

export default Elber