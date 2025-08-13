import React from 'react'
import { StyleProp, Text, TextStyle } from 'react-native'
import textStyles from '../../../styles/text.style';

interface CustomTextProps {
    type: 'title' | 'subtitle' | 'text' | 'error';
    text: string;
    style?: StyleProp<TextStyle>;
}

const CustomText = ({text, type, style}: CustomTextProps) => {
    return (
        <Text style={[textStyles[type], style]}>
            {text}
        </Text>
    )
}

export default CustomText