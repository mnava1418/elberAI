import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'

const SPHERE_SIZE = 220

interface VoiceSphereProps {
    isWaiting: boolean,
    isTalking: boolean
}

const VoiceSphere = ({ isWaiting, isTalking }: VoiceSphereProps) => {
    const rotation1 = useSharedValue(0)
    const rotation2 = useSharedValue(0)
    const rotation3 = useSharedValue(0)
    const pulse = useSharedValue(1)
    const thinkingRotation = useSharedValue(0)
    const ripple1Scale = useSharedValue(1)
    const ripple1Opacity = useSharedValue(0)
    const ripple2Scale = useSharedValue(1)
    const ripple2Opacity = useSharedValue(0)

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

    useEffect(() => {
        if (isWaiting) {
            thinkingRotation.value = withRepeat(
                withTiming(360, { duration: 800, easing: Easing.linear }),
                -1,
                false
            )
        } else {
            cancelAnimation(thinkingRotation)
            thinkingRotation.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
        }
    }, [isWaiting])

    useEffect(() => {
        if (isTalking) {
            const DURATION = 1400

            ripple1Scale.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 0 }),
                    withTiming(1.75, { duration: DURATION, easing: Easing.out(Easing.ease) })
                ), -1, false
            )
            ripple1Opacity.value = withRepeat(
                withSequence(
                    withTiming(0.55, { duration: 0 }),
                    withTiming(0, { duration: DURATION, easing: Easing.out(Easing.ease) })
                ), -1, false
            )
            ripple2Scale.value = withDelay(DURATION / 2, withRepeat(
                withSequence(
                    withTiming(1, { duration: 0 }),
                    withTiming(1.75, { duration: DURATION, easing: Easing.out(Easing.ease) })
                ), -1, false
            ))
            ripple2Opacity.value = withDelay(DURATION / 2, withRepeat(
                withSequence(
                    withTiming(0.55, { duration: 0 }),
                    withTiming(0, { duration: DURATION, easing: Easing.out(Easing.ease) })
                ), -1, false
            ))
        } else {
            cancelAnimation(ripple1Scale)
            cancelAnimation(ripple1Opacity)
            cancelAnimation(ripple2Scale)
            cancelAnimation(ripple2Opacity)
            ripple1Opacity.value = withTiming(0, { duration: 300 })
            ripple2Opacity.value = withTiming(0, { duration: 300 })
        }
    }, [isTalking])

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
    const thinkingStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${thinkingRotation.value}deg` }],
    }))
    const ripple1Style = useAnimatedStyle(() => ({
        transform: [{ scale: ripple1Scale.value }],
        opacity: ripple1Opacity.value,
    }))
    const ripple2Style = useAnimatedStyle(() => ({
        transform: [{ scale: ripple2Scale.value }],
        opacity: ripple2Opacity.value,
    }))

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.ring, ripple1Style]} />
            <Animated.View style={[styles.ring, ripple2Style]} />
            <Animated.View style={[styles.sphere, pulseStyle, thinkingStyle]}>
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
    ring: {
        position: 'absolute',
        width: SPHERE_SIZE,
        height: SPHERE_SIZE,
        borderRadius: SPHERE_SIZE / 2,
        borderWidth: 2,
        borderColor: '#D16BA5',
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
