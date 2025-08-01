import React from 'react'
import { Pressable, Text } from 'react-native';
import buttonStyles from '../../../styles/button.style';
import { appColors } from '../../../styles/main.style';

interface ButtonProps {
    type: 'primary' | 'secondary';
    title: string;
    onPress: () => void;
    textColor?: string;
}

const Button = ({ type, title, onPress, textColor}: ButtonProps) => {
    return (
        <Pressable
            style={({pressed}) => ([
                type === 'primary' ? buttonStyles.primary : buttonStyles.secondary,
                { opacity: pressed ? 0.8 : 1 },            
            ])}
            onPress={onPress}
        >
            <Text
                style={[
                    buttonStyles.text,
                    type === 'primary' ? buttonStyles.primaryText : { color: textColor || appColors.primary },
                ]}
            >
                {title}
            </Text>
        </Pressable>
    )
}

export default Button