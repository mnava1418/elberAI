import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import SettingsScreen from './SettingsScreen';
import ProfileSettingsScreen from './ProfileSettingsScreen';
import EndpointsSettingsScreen from './EndpointsSettingsScreen';

export type SettingsStackParamList = {
    Settings: undefined;
    ProfileSettings: undefined;
    EndpointsSettings: undefined;
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => {
    return (
        <SettingsStack.Navigator
            initialRouteName='Settings'
            screenOptions={{
                headerShown: false
            }}
        >
            <SettingsStack.Screen name='Settings' component={SettingsScreen} />
            <SettingsStack.Screen name='ProfileSettings' component={ProfileSettingsScreen} />
            <SettingsStack.Screen name='EndpointsSettings' component={EndpointsSettingsScreen} />
        </SettingsStack.Navigator>
    )
}

export default SettingsNavigator