import React from 'react'
import { View } from 'react-native'
import CustomText from '../ui/CustomText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import NavBtn from './NavBtn'
import navBarStyles from '../../../styles/navBar'

interface NavBarProps  {
    title: string,
    navigation: NativeStackNavigationProp<any, string, undefined> | undefined
}

const NavBar = ({title, navigation}: NavBarProps) => {
    const {top} = useSafeAreaInsets()
    
    return (
        <View style={[navBarStyles.container, { marginTop: top}]}>
            {navigation ? <NavBtn icon='chevron-back' onPress={() => {navigation.goBack()}} /> : <></>}
            <View style={navBarStyles.title}>
                <CustomText style={{fontWeight: '600', fontSize: 20}} type='text' text={title} />
            </View>
        </View>
    )
}

export default NavBar