import React, { useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import SocketModel from '../../../models/Socket.model'
import Chat from '../../components/chat/Chat'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { MainScreenTabProps } from './MainScreen'

type ChatScreenProps = {
    setShowTabBar: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatScreen = ({setShowTabBar}: ChatScreenProps) => {
    const navigation = useNavigation<NavigationProp<MainScreenTabProps>>()

    const goBack = () => {
        setShowTabBar(true)
        navigation.goBack()
    }

    useEffect(() => {
      SocketModel.getInstance().connect()
    
      return () => {
        SocketModel.getInstance().disconnect()
      }
    }, [])
    
    return (
        <MainView navBarTitle='Chat' leftAction={goBack} applyPadding={false}>
          <Chat />
        </MainView>
    )
}

export default ChatScreen
