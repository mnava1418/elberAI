import React, { useContext, useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import Chat from '../../components/chat/Chat'
import { useNavigation, DrawerActions, useRoute, RouteProp } from '@react-navigation/native'
import SocketModel from '../../../models/Socket.model'
import { GlobalContext } from '../../../store/GlobalProvider'

type ChatScreenParams = {
    chatId?: string;
};

type ChatScreenRouteProp = RouteProp<{ChatScreen: ChatScreenParams}, 'ChatScreen'>;

const ChatScreen = () => {
    const navigation = useNavigation()
    const route = useRoute<ChatScreenRouteProp>()
    const { dispatch } = useContext(GlobalContext);

    const chatId = route.params?.chatId || ''
    const chatName = route.name

    const showMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer)
    }

    useEffect(() => {
      SocketModel.getInstance().connect(dispatch)
    
      return () => {
        SocketModel.getInstance().disconnect()
      }
    }, [])
    
    return (
        <MainView navBarTitle={`${chatName} - ${chatId}`} leftAction={showMenu} leftIcon='menu-outline' applyPadding={false}>
          <Chat />
        </MainView>
    )
}

export default ChatScreen
