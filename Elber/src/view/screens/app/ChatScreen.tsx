import React, { useContext, useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import Chat from '../../components/chat/Chat'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import SocketModel from '../../../models/Socket.model'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectChatInfo } from '../../../store/selectors/chat.selector'

const ChatScreen = () => {
    const navigation = useNavigation()
    const { dispatch, state } = useContext(GlobalContext);
    const chatInfo = selectChatInfo(state.chat)
    
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
        <MainView navBarTitle={chatInfo.name ? chatInfo.name : 'Chat Nuevo'} leftAction={showMenu} leftIcon='menu-outline' applyPadding={false}>
          <Chat />
        </MainView>
    )
}

export default ChatScreen
