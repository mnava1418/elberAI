import React, { useContext, useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import Chat from '../../components/chat/Chat'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { MainScreenTabProps } from './MainScreen'
import SocketModel from '../../../models/Socket.model'
import { GlobalContext } from '../../../store/GlobalProvider'

type ChatScreenProps = {
    setShowTabBar: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatScreen = ({setShowTabBar}: ChatScreenProps) => {
    const navigation = useNavigation<NavigationProp<MainScreenTabProps>>()
    const { dispatch } = useContext(GlobalContext);

    const goBack = () => {
        setShowTabBar(true)
        navigation.navigate('Ajustes')
    }

    useEffect(() => {
      SocketModel.getInstance().connect(dispatch)
    
      return () => {
        SocketModel.getInstance().disconnect()
      }
    }, [])
    
    return (
        <MainView navBarTitle='Elber' leftAction={goBack} applyPadding={false}>
          <Chat />
        </MainView>
    )
}

export default ChatScreen
