import React, { useContext, useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import Chat from '../../components/chat/Chat'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import SocketModel from '../../../models/Socket.model'
import { GlobalContext } from '../../../store/GlobalProvider'

const ChatScreen = () => {
    const navigation = useNavigation()
    const { dispatch } = useContext(GlobalContext);

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
        <MainView navBarTitle='Elber' leftAction={showMenu} leftIcon='menu-outline' applyPadding={false}>
          <Chat />
        </MainView>
    )
}

export default ChatScreen
