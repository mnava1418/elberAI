import React, { PropsWithChildren } from 'react'
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { appColors } from '../../../styles/main.style';
import NavBar from '../navBar/NavBar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const backgroundImage = require('../../../assets/images/mainBackground.png');

interface MainViewProps extends PropsWithChildren {
    navBarTitle?: string
    showNavBar?: boolean
    navigation?: NativeStackNavigationProp<any, string, undefined> | undefined
    style?: StyleProp<ViewStyle>;
}

const MainView = ({ style, children, navBarTitle= '', navigation= undefined, showNavBar= true }: MainViewProps) => {
    return (
        <ImageBackground source={backgroundImage} style={{flex: 1}} blurRadius={100}>
            <View style={{flex: 1, position: 'relative'}}>
                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {backgroundColor: appColors.primary,zIndex: 1, opacity: 0.4}
                    ]}
                    pointerEvents="none"
                />
                { showNavBar ? <NavBar title={navBarTitle} navigation={navigation} /> : <></>}
                <View style={[{flex: 1, paddingHorizontal: 20, zIndex: 2}, style]}>
                    {children}
                </View>
            </View>
        </ImageBackground>
    )
}

export default MainView;