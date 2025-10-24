import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import TabBar from '../../components/tabBar/TabBar';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import ChatScreen from './ChatScreen';

export type MainScreenTabProps = {
    Elber: undefined
    Ajustes: undefined
    Chat: undefined
}

const Tab = createBottomTabNavigator<MainScreenTabProps>();

const MainScreen = () => {
    const [showTabBar, setShowTabBar] = useState(true)
    
    return (
        <>
            <Tab.Navigator 
                screenOptions={{headerShown: false,}} 
                tabBar={(props) => <TabBar {...props} showTabBar={showTabBar} setShowTabBar={setShowTabBar} />}
            >
                <Tab.Screen name='Elber' component={HomeScreen} />
                <Tab.Screen name='Chat'>
                    {(props) => <ChatScreen {...props} setShowTabBar={setShowTabBar} />}
                </Tab.Screen>
                <Tab.Screen name='Ajustes' component={SettingsScreen} />
            </Tab.Navigator>
        </>
    )
}

export default MainScreen