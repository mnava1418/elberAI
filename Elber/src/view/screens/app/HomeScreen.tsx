import React, { useContext, useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import SocketModel from '../../../models/Socket.model'
import { GlobalContext } from '../../../store/GlobalProvider';

const HomeScreen = () => {
  const { dispatch } = useContext(GlobalContext);

    useEffect(() => {
      SocketModel.getInstance().connect(dispatch)
    
      return () => {
        SocketModel.getInstance().disconnect()
      }
    }, [])
    
    return (
        <MainView navBarTitle='Elber' />
    )
}

export default HomeScreen
