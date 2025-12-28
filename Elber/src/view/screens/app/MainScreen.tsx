import {createDrawerNavigator} from '@react-navigation/drawer'
import SettingsScreen from './SettingsScreen';
import Alert from '../../components/ui/Alert';
import ChatScreen from './ChatScreen';
import { appColors } from '../../../styles/main.style';
import { useState } from 'react';

const Drawer = createDrawerNavigator()

const MainScreen = () => {
    const [activeScreen, setActiveScreen] = useState<string>('')

    return (
        <>
            <Drawer.Navigator 
                screenOptions={{
                    headerShown: false,
                    drawerStyle: {
                        backgroundColor: appColors.primary,                    
                    },
                    drawerActiveTintColor: appColors.text,
                    drawerInactiveTintColor: appColors.subtitle,
                    drawerActiveBackgroundColor: appColors.secondary,
                    drawerLabelStyle: {
                        fontSize: 18,
                        fontWeight: '500',
                    }
                }}
                screenListeners={{
                    state: (e) => {
                        const state = e.data.state;
                        if (state && state.routes) {
                            const activeRoute = state.routes[state.index];
                            if(activeScreen === activeRoute.name) {
                                return
                            }

                            console.log('Screen seleccionado:', activeRoute.name);
                            console.log('Parámetros:', activeRoute.params);
                            setActiveScreen(activeRoute.name);
                        }
                    }
                }}
            >
                <Drawer.Screen 
                    name='Chat A' 
                    component={ChatScreen} 
                    initialParams={{chatId: '1'}}
                />
                <Drawer.Screen 
                    name='Chat B' 
                    component={ChatScreen} 
                    initialParams={{chatId: '2'}}
                />
                <Drawer.Screen 
                    name='Chat C' 
                    component={ChatScreen} 
                    initialParams={{chatId: '3'}}
                />                   
                <Drawer.Screen name='Ajustes' component={SettingsScreen} />
            </Drawer.Navigator>
            <Alert />
        </>
    )
}

export default MainScreen