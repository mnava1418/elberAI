import {createDrawerNavigator} from '@react-navigation/drawer'
import SettingsScreen from './SettingsScreen';
import Alert from '../../components/ui/Alert';
import ChatScreen from './ChatScreen';
import { useContext, useEffect } from 'react';
import { getChats } from '../../../services/chat.service';
import { GlobalContext } from '../../../store/GlobalProvider';
import { setChats } from '../../../store/actions/chat.actions';
import { getSelectedChatId, selectChats } from '../../../store/selectors/chat.selector';
import SideMenuContent from '../../components/ui/SideMenu';

const Drawer = createDrawerNavigator()

const MainScreen = () => {
    const { dispatch, state} = useContext(GlobalContext);
    const elberChats = selectChats(state.chat)
    const selectedChatId = getSelectedChatId(state.chat)

    useEffect(() => {
        getChats()
        .then(chats => {
            dispatch(setChats(chats))
        })
        .catch(error => {
            console.error(error)
        })
    }, [])
    
    const chatEntries = Array.from(elberChats.values())
    chatEntries.sort((a, b) => b.id - a.id)

    return (
        <>
            <Drawer.Navigator 
                drawerContent={(props) => <SideMenuContent props={props} chatEntries={chatEntries} selectedChatId={selectedChatId} />}
                screenOptions={{
                    headerShown: false,
                }}                
            >   
                <Drawer.Screen name='Chat Nuevo' component={ChatScreen} initialParams={{id: -1}}/>
                {chatEntries.map(chat => {
                    return (
                        <Drawer.Screen 
                            key={chat.id} 
                            name={chat.name} 
                            component={ChatScreen} 
                            initialParams={{id: chat.id}}
                        />
                    )
                })}
    
                <Drawer.Screen name='Ajustes' component={SettingsScreen} />
            </Drawer.Navigator>
            <Alert />
        </>
    )
}

export default MainScreen