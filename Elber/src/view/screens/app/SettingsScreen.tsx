import React, { useContext } from 'react'
import MainView from '../../components/ui/MainView'
import Button from '../../components/ui/Button'
import { logOut } from '../../../services/auth.service'
import { GlobalContext } from '../../../store/GlobalProvider'

const SettingsScreen = () => {
    const {dispatch} = useContext(GlobalContext)

    return (
        <MainView>
            <Button type='primary' title='Salir' onPress={() => {logOut(dispatch)}} />
        </MainView>
    )
}

export default SettingsScreen