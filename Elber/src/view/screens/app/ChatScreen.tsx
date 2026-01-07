import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import Chat from '../../components/chat/Chat'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectChatInfo } from '../../../store/selectors/chat.selector'
import * as chatServices from '../../../services/chat.service'
import { deleteChatAction } from '../../../store/actions/chat.actions'
import { hideAlert, showAlert } from '../../../store/actions/elber.actions'

const ChatScreen = () => {
    const navigation = useNavigation()
    const { dispatch, state } = useContext(GlobalContext);
    const chatInfo = selectChatInfo(state.chat)
    
    const showMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer)
    }

    const deleteChat = () => {
      chatServices.deleteChat(chatInfo.id)
        .then(() => {
          dispatch(deleteChatAction(chatInfo.id))
        })
        .catch(error => {
          console.error(error)
        })
    }

    const confirmDeleteChat = () => {
      dispatch(showAlert({
        btnText: 'Eliminar Chat',
        isVisible: true,
        title: 'Eliminar Chat',
        text: '¿Estás seguro de que deseas eliminar este chat? Esta acción no se puede deshacer.',
        onPress: () => {
          deleteChat()
          dispatch(hideAlert())
        }
      }))
    }
    
    return (
        <MainView 
          navBarTitle={chatInfo.name ? chatInfo.name : 'Chat Nuevo'} 
          leftAction={showMenu} 
          leftIcon='menu-outline' 
          applyPadding={false}
          rightAction={ chatInfo.id !== -1 ? confirmDeleteChat : undefined}          
          rightIcon='trash-outline'
        >
          <Chat />
        </MainView>
    )
}

export default ChatScreen
