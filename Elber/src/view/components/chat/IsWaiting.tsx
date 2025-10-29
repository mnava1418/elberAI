import React, { useEffect } from 'react'
import { Animated, View } from 'react-native'
import chatStyles from '../../../styles/chat.style'
import AppIcon from '../ui/AppIcon'
import useIsWaiting from '../../../hooks/animation/useIsWaiting'
import { appColors } from '../../../styles/main.style'

const IsWaiting = () => {
    const {
        dot1Opacity, dot2Opacity, dot3Opacity,
        animateWaiting
    } = useIsWaiting()

    useEffect(() => {
        animateWaiting();
    }, []);

    return (
        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            <View style={[chatStyles.bubble, {backgroundColor: appColors.secondary}]}>
                <View style={{flexDirection: 'row', justifyContent: 'center', margin: 4}}>
                    <Animated.Text style={[{opacity: dot1Opacity, marginRight: 2}]}>
                        <AppIcon name='ellipse' size={10} />
                    </Animated.Text>
                    <Animated.Text style={[{opacity: dot2Opacity, marginRight: 2}]}>
                        <AppIcon name='ellipse' size={10} />
                    </Animated.Text>
                    <Animated.Text style={[{opacity: dot3Opacity, marginRight: 2}]}>
                        <AppIcon name='ellipse' size={10} />
                    </Animated.Text>
                </View>
            </View>
        </View>
    )
}

export default IsWaiting