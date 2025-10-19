import React, { useContext, useEffect } from 'react'
import MainView from '../../components/ui/MainView'
import CustomText from '../../components/ui/CustomText'
import Button from '../../components/ui/Button'
import { logOut } from '../../../services/auth.service'
import { GlobalContext } from '../../../store/GlobalProvider'
import SocketModel from '../../../models/Socket.model'

const HomeScreen = () => {
    const {dispatch} = useContext(GlobalContext)

    useEffect(() => {
      SocketModel.getInstance().connect()
    
      return () => {
        SocketModel.getInstance().disconnect()
      }
    }, [])
    
    return (
        <MainView>
            <CustomText type='title' text='Bienvenido a Elber' />
            <Button type='primary' title='Salir' onPress={() => {logOut(dispatch)}} />
        </MainView>
    )
}

export default HomeScreen
