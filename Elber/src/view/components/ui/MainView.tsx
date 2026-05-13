import React, { PropsWithChildren } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native';
import NavBar from '../navBar/NavBar';
import LinearGradient from 'react-native-linear-gradient';

interface MainViewProps extends PropsWithChildren {
    navBarTitle?: string
    showNavBar?: boolean
    leftAction?: () => void
    leftIcon?: string
    rightAction?: () => void
    rightIcon?: string
    style?: StyleProp<ViewStyle>;
    applyPadding?: boolean
}

const MainView = ({ 
    style, 
    children, 
    navBarTitle= '', 
    leftAction = undefined, 
    leftIcon = 'chevron-back', 
    showNavBar= true, 
    applyPadding = true,
    rightAction = undefined,
    rightIcon = ''
}: MainViewProps) => {
    return (
        <LinearGradient
            colors={['#06070d', '#0d0f1a']}
            locations={[0, 1]}
            style={{flex: 1, position: 'relative'}}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            { showNavBar ? <NavBar title={navBarTitle} leftAction={leftAction} leftIcon={leftIcon} rightAction={rightAction} rightIcon={rightIcon} /> : <></>}
            <View style={[{flex: 1, paddingHorizontal: applyPadding ? 20 : 0, zIndex: 2}, style]}>
                {children}
            </View>
        </LinearGradient>
    )
}

export default MainView;