import React from 'react'
import { View } from 'react-native'
import CustomText from '../ui/CustomText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NavBtn from './NavBtn'
import navBarStyles from '../../../styles/navBar'

interface NavBarProps  {
    title: string,
    leftAction?: () => void
    leftIcon?: string
    rightAction?: () => void
    rightIcon?: string
}

const NavBar = ({title, leftAction = undefined, leftIcon = 'chevron-back', rightAction = undefined, rightIcon = ''}: NavBarProps) => {
    const {top} = useSafeAreaInsets()
    
    return (
        <View style={[navBarStyles.container, { marginTop: top}]}>
            <View style={{width: 32, height: 32}}>
                {leftAction ? <NavBtn icon={leftIcon} onPress={leftAction} /> : <></>}
            </View>
            <View style={navBarStyles.title}>
                <CustomText style={{fontWeight: '600', fontSize: 20, marginHorizontal: 16}} type='text' text={title.length >= 30 ? `${title.substring(0, 30)}...` : title} />
            </View>
            <View style={{width: 32, height: 32}}>
                {rightAction ? <NavBtn icon={rightIcon} onPress={rightAction} /> : <></>}
            </View>
        </View>
    )
}

export default NavBar