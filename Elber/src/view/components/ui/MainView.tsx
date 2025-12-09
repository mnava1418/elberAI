import React, { PropsWithChildren } from 'react'
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { appColors } from '../../../styles/main.style';
import NavBar from '../navBar/NavBar';

const backgroundImage = require('../../../assets/images/mainBackground.png');

interface MainViewProps extends PropsWithChildren {
    navBarTitle?: string
    showNavBar?: boolean
    leftAction?: () => void | undefined
    style?: StyleProp<ViewStyle>;
    applyPadding?: boolean
}

const MainView = ({ style, children, navBarTitle= '', leftAction = undefined, showNavBar= true, applyPadding = true }: MainViewProps) => {
    return (
        <ImageBackground source={backgroundImage} style={{flex: 1}} blurRadius={100}>
            <View style={{flex: 1, position: 'relative'}}>
                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {backgroundColor: appColors.primary,zIndex: 1, opacity: 0.5}
                    ]}
                    pointerEvents="none"
                />
                { showNavBar ? <NavBar title={navBarTitle} leftAction={leftAction} /> : <></>}
                <View style={[{flex: 1, paddingHorizontal: applyPadding ? 20 : 0, zIndex: 2}, style]}>
                    {children}
                </View>
            </View>
        </ImageBackground>
    )
}

export default MainView;