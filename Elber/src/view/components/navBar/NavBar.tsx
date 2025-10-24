import React from 'react'
import { View } from 'react-native'
import CustomText from '../ui/CustomText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NavBtn from './NavBtn'
import navBarStyles from '../../../styles/navBar'

interface NavBarProps  {
    title: string,
    leftAction?: () => void | undefined
}

const NavBar = ({title, leftAction = undefined}: NavBarProps) => {
    const {top} = useSafeAreaInsets()
    
    return (
        <View style={[navBarStyles.container, { marginTop: top}]}>
            {leftAction ? <NavBtn icon='chevron-back' onPress={leftAction} /> : <></>}
            <View style={navBarStyles.title}>
                <CustomText style={{fontWeight: '600', fontSize: 20}} type='text' text={title} />
            </View>
        </View>
    )
}

export default NavBar