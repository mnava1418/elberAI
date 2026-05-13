import React, { useEffect } from 'react'
import { Image, Text, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'
import { appColors } from '../../../styles/main.style'

const EmptyChat = () => {
    const floatY = useSharedValue(0)

    useEffect(() => {
        floatY.value = withRepeat(
            withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        )
    }, [])

    const floatStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatY.value }],
    }))

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
            <Animated.View style={[floatStyle, { marginBottom: 32 }]}>
                <View style={{
                    shadowColor: appColors.cyan,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 24,
                    elevation: 10,
                }}>
                    <Image
                        source={require('../../../assets/images/elber.png')}
                        style={{ width: 100, height: 100 }}
                        resizeMode='contain'
                    />
                </View>
            </Animated.View>

            <Text style={{
                fontSize: 28,
                fontWeight: '500',
                color: appColors.text,
                textAlign: 'center',
                letterSpacing: -0.5,
                lineHeight: 34,
                marginBottom: 12,
            }}>
                {'¿en qué te '}
                <Text style={{ color: appColors.cyan, fontStyle: 'italic' }}>
                    echo la mano?
                </Text>
            </Text>

            <Text style={{
                fontSize: 14,
                color: appColors.dim,
                textAlign: 'center',
                lineHeight: 21,
            }}>
                Pregúntame, cuéntame algo, o pídeme que recuerde lo que importa.
            </Text>
        </View>
    )
}

export default EmptyChat
