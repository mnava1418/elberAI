import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useContext, useEffect } from 'react'
import AuthMainScreen from './screens/auth/AuthMainScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RequestAccessScreen from './screens/auth/RequestAccessScreen';
import AccessCodeScreen from './screens/auth/AccessCodeScreen';
import SignUpNameScreen from './screens/auth/SignUpNameScreen';
import SignUpPasswordScreen from './screens/auth/SignUpPasswordScreen';
import SignUpConfirmPasswordScreen from './screens/auth/SignUpConfirmPasswordScreen';
import SignUpWelcomeScreen from './screens/auth/SignUpWelcomeScreen';
import { onAuthStateChanged, getAuth } from '@react-native-firebase/auth';
import { logOut } from '../services/auth.service';
import { GlobalContext } from '../store/GlobalProvider';
import { selectIsLoggedIn } from '../store/selectors/user.selector';
import HomeScreen from './screens/app/HomeScreen';
import { logInUser } from '../store/actions/user.actions';

export type AuthStackParamList = {
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

export type AppStackParamList = {
  Home: undefined;
}

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const Elber = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const isLoggedIn = selectIsLoggedIn(state.user)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            if(user && user.emailVerified) {
                console.log('Usuario autenticado:', user.email);
                dispatch(logInUser({name: user.displayName || '', email: user.email || ''}));
            } else {
                logOut(dispatch)
                .catch((error: any) => {
                    console.error('Error al cerrar sesión:', error);
                });
            }
        });
        return unsubscribe;
    }, []);

    const getAuthStack = () => {
        return (
            <AuthStack.Navigator 
                initialRouteName="AuthMain"
                screenOptions={{
                    headerStyle: {backgroundColor: '#000'},
                    headerTintColor: '#fff',
                }}
            >
                <AuthStack.Screen name="AuthMain" component={AuthMainScreen} options={{ headerShown: false }} />
                <AuthStack.Screen name="Login" component={LoginScreen} />
                <AuthStack.Screen name="RequestAccess" component={RequestAccessScreen} />
                <AuthStack.Screen name="AccessCode" component={AccessCodeScreen} />            
                <AuthStack.Screen name="SignUpName" component={SignUpNameScreen} />            
                <AuthStack.Screen name="SignUpPassword" component={SignUpPasswordScreen} />            
                <AuthStack.Screen name="SignUpConfirmPassword" component={SignUpConfirmPasswordScreen} />     
                <AuthStack.Screen name="SignUpWelcome" component={SignUpWelcomeScreen} options={{headerShown: false}} />       
            </AuthStack.Navigator>
        )
    }

    const getAppStack = () => {
        return (
            <AppStack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {backgroundColor: '#000'},
                    headerTintColor: '#fff',
                }}
            >
                <AppStack.Screen name="Home" component={HomeScreen} />
            </AppStack.Navigator>
        )
    }
    
    return (
        <>
        {isLoggedIn ? getAppStack() : getAuthStack()}
        </>
    );  
}

export default Elber