import React, { PropsWithChildren } from 'react'
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { appColors } from '../../../styles/main.style';

const backgroundImage = require('../../../assets/images/mainBackground.png');

interface MainViewProps extends PropsWithChildren {
    style?: StyleProp<ViewStyle>;
}

const MainView = ({ style, children }: MainViewProps) => {
    return (
        <ImageBackground source={backgroundImage} style={{flex: 1}} blurRadius={100}>
            <View style={{flex: 1, position: 'relative'}}>
                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {backgroundColor: appColors.primary,zIndex: 1, opacity: 0.6}
                    ]}
                    pointerEvents="none"
                />
                <View style={[{flex: 1, padding: 20, zIndex: 2}, style]}>
                    {children}
                </View>
            </View>
        </ImageBackground>
    )
}

export default MainView;