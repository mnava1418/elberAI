import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const useChat = () => {
    const {bottom} = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const [inputText, setInputText] = useState('')
    
    const animatedStyle = useAnimatedStyle(() => {
        const targetPadding = keyboard.height.value > 0 ? keyboard.height.value : bottom;
        
        return {
            paddingBottom: withTiming(targetPadding, {
                duration:50,
                easing: Easing.linear,
            })
        };
    });

    return {
        inputText, setInputText,
        animatedStyle
    }
}

export default useChat