import { Animated } from 'react-native';
import { useRef } from 'react';

const useFadeIn = (duration: number = 1000) => {
    const fadeIn = useRef(new Animated.Value(0)).current;

    const setFadeIn = () => {
        Animated.timing(fadeIn, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start();
    }
    return { fadeIn, setFadeIn };
};

export default useFadeIn;