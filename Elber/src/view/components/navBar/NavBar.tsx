import React from 'react'
import { View } from 'react-native'
import CustomText from '../ui/CustomText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NavBtn from './NavBtn'
import navBarStyles from '../../../styles/navBar'

interface NavBarProps  {
    title: string,
    leftAction?: () => void | undefined
    leftIcon?: string
}

const NavBar = ({title, leftAction = undefined, leftIcon = 'chevron-back'}: NavBarProps) => {
    const {top} = useSafeAreaInsets()
    
    return (
        <View style={[navBarStyles.container, { marginTop: top}]}>
            <View style={{width: 32, height: 32}}>
                {leftAction ? <NavBtn icon={leftIcon} onPress={leftAction} /> : <></>}
            </View>
            <View style={navBarStyles.title}>
                <CustomText style={{fontWeight: '600', fontSize: 20}} type='text' text={title} />
            </View>
            <View style={{width: 32, height: 32}} />
        </View>
    )
}

export default NavBar