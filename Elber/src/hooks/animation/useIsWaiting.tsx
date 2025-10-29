import { useRef } from "react";
import { Animated } from "react-native";

const useIsWaiting = () => {
    const dot1Opacity = useRef(new Animated.Value(0.3)).current;
    const dot2Opacity = useRef(new Animated.Value(0.3)).current;
    const dot3Opacity = useRef(new Animated.Value(0.3)).current;
    
    const animateWaiting = () => {
        const animateDot = (dotOpacity: Animated.Value, delay: number) => {
            return Animated.sequence([
                Animated.delay(delay),
                Animated.timing(dotOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(dotOpacity, {
                    toValue: 0.3,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]);
        };

        Animated.loop(
            Animated.parallel([
                animateDot(dot1Opacity, 0),
                animateDot(dot2Opacity, 200),
                animateDot(dot3Opacity, 400),
            ])
        ).start();
    };

    return { dot1Opacity, dot2Opacity, dot3Opacity, animateWaiting}
}

export default useIsWaiting