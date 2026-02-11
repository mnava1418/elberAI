import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import SettingsScreen from './SettingsScreen';
import ProfileSettingsScreen from './ProfileSettingsScreen';

export type SettingsStackParamList = {
    Settings: undefined;
    ProfileSettings: undefined
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
        </SettingsStack.Navigator>
    )
}

export default SettingsNavigator