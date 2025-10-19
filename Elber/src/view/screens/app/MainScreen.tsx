import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import TabBar from '../../components/tabBar/TabBar';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import ChatScreen from './ChatScreen';

export type MainScreenTapProps = {
    Home: undefined
    Settings: undefined
    Chat: undefined
}

const Tab = createBottomTabNavigator<MainScreenTapProps>();

const MainScreen = () => {
    const [showTabBar, setShowTabBar] = useState(true)
    
    return (
        <>
            <Tab.Navigator 
                screenOptions={{headerShown: false,}} 
                tabBar={(props) => <TabBar {...props} showTabBar={showTabBar} />}
            >
                <Tab.Screen name='Home' component={HomeScreen} />
                <Tab.Screen name='Chat' component={ChatScreen}/>
                <Tab.Screen name='Settings' component={SettingsScreen} />
            </Tab.Navigator>
        </>
    )
}

export default MainScreen