import React, { useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import CustomText from '../../components/ui/CustomText'
import SocketModel from '../../../models/Socket.model'

const ChatScreen = () => {
    useEffect(() => {
      SocketModel.getInstance().connect()
    
      return () => {
        SocketModel.getInstance().disconnect()
      }
    }, [])
    
    return (
        <MainView navBarTitle='Chat' />
    )
}

export default ChatScreen
