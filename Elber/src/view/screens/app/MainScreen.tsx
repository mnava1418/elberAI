import {createDrawerNavigator} from '@react-navigation/drawer'
import SettingsScreen from './SettingsScreen';
import Alert from '../../components/ui/Alert';
import ChatScreen from './ChatScreen';

const Drawer = createDrawerNavigator()

const MainScreen = () => {
    return (
        <>
            <Drawer.Navigator screenOptions={{headerShown: false}}>
                <Drawer.Screen name='Chat' component={ChatScreen} />                    
                <Drawer.Screen name='Ajustes' component={SettingsScreen} />
            </Drawer.Navigator>
            <Alert />
        </>
    )
}

export default MainScreen