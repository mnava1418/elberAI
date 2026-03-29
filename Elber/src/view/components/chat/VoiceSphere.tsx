import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'

const SPHERE_SIZE = 220

const VoiceSphere = () => {
    const rotation1 = useSharedValue(0)
    const rotation2 = useSharedValue(0)
    const rotation3 = useSharedValue(0)
    const pulse = useSharedValue(1)

    useEffect(() => {
        rotation1.value = withRepeat(
            withTiming(360, { duration: 4000, easing: Easing.linear }),
            -1,
            false
        )
        rotation2.value = withRepeat(
            withTiming(-360, { duration: 6500, easing: Easing.linear }),
            -1,
            false
        )
        rotation3.value = withRepeat(
            withTiming(360, { duration: 9000, easing: Easing.linear }),
            -1,
            false
        )
        pulse.value = withRepeat(
            withTiming(1.06, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        )
    }, [])

    const animStyle1 = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation1.value}deg` }],
    }))
    const animStyle2 = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation2.value}deg` }],
    }))
    const animStyle3 = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation3.value}deg` }],
    }))
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }))

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.sphere, pulseStyle]}>
                {/* Base layer */}
                <LinearGradient
                    colors={['#D16BA5', '#E080A8']}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Layer 1 — clockwise */}
                <Animated.View style={[StyleSheet.absoluteFillObject, animStyle1]}>
                    <LinearGradient
                        colors={['#D16BA5', '#FFB8D8', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                </Animated.View>

                {/* Layer 2 — counter-clockwise */}
                <Animated.View style={[StyleSheet.absoluteFillObject, animStyle2]}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', '#E080A8', '#D16BA5']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[StyleSheet.absoluteFillObject, { opacity: 0.9 }]}
                    />
                </Animated.View>

                {/* Layer 3 — slow swirl */}
                <Animated.View style={[StyleSheet.absoluteFillObject, animStyle3]}>
                    <LinearGradient
                        colors={['#FFA0C8', 'rgba(0,0,0,0)', '#D16BA5', 'rgba(0,0,0,0)']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={[StyleSheet.absoluteFillObject, { opacity: 0.85 }]}
                    />
                </Animated.View>

                {/* 3D — vignette top */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.45 }}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* 3D — vignette bottom */}
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                    start={{ x: 0.5, y: 0.55 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* 3D — vignette left */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 0.45, y: 0.5 }}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* 3D — vignette right */}
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                    start={{ x: 0.55, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFillObject}
                />

            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    sphere: {
        width: SPHERE_SIZE,
        height: SPHERE_SIZE,
        borderRadius: SPHERE_SIZE / 2,
        overflow: 'hidden',
        shadowColor: '#D16BA5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 25,
        elevation: 20,
    },
})

export default VoiceSphere
