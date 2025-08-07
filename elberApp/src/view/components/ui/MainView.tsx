import React, { PropsWithChildren } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native';
import { appColors } from '../../../styles/main.style';

interface MainViewProps extends PropsWithChildren {
    style?: StyleProp<ViewStyle>;
}

const MainView = ({ style, children }: MainViewProps) => {
    return (
        <View style={[{flex: 1, padding: 20, backgroundColor: appColors.primary}, style]}>
            {children}
        </View>
    )
}

export default MainView