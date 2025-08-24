import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import AuthMainScreen from './screens/auth/AuthMainScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RequestAccessScreen from './screens/auth/RequestAccessScreen';
import AccessCodeScreen from './screens/auth/AccessCodeScreen';
import SignUpNameScreen from './screens/auth/SignUpNameScreen';
import SignUpPasswordScreen from './screens/auth/SignUpPasswordScreen';
import SignUpConfirmPasswordScreen from './screens/auth/SignUpConfirmPasswordScreen';
import SignUpWelcomeScreen from './screens/auth/SignUpWelcomeScreen';

export type RootStackParamList = {
  AuthMain: undefined;
  Login: undefined;
  
  /*SIGN UP SCREENS */
  RequestAccess: undefined;
  AccessCode: undefined;
  SignUpName: undefined;
  SignUpPassword: undefined;
  SignUpConfirmPassword: undefined;
  SignUpWelcome: undefined
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
            <Stack.Screen name="SignUpName" component={SignUpNameScreen} />            
            <Stack.Screen name="SignUpPassword" component={SignUpPasswordScreen} />            
            <Stack.Screen name="SignUpConfirmPassword" component={SignUpConfirmPasswordScreen} />     
            <Stack.Screen name="SignUpWelcome" component={SignUpWelcomeScreen} options={{headerShown: false}} />       
        </Stack.Navigator>
    );  
}

export default Elber