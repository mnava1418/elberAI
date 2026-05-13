import React from 'react'
import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import buttonStyles from '../../../styles/button.style';
import { appColors } from '../../../styles/main.style';

interface ButtonProps {
    type: 'primary' | 'secondary';
    title: string;
    onPress: () => void;
    textColor?: string;
    style?: StyleProp<ViewStyle>;
}

const Button = ({ type, title, onPress, textColor, style}: ButtonProps) => {
    if (type === 'primary') {
        return (
            <LinearGradient
                colors={[appColors.cyan, appColors.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[buttonStyles.primary, style ? style : {}]}
            >
                <Pressable
                    style={({pressed}) => ([
                        buttonStyles.gradient,
                        { opacity: pressed ? 0.8 : 1 },
                    ])}
                    onPress={onPress}
                >
                    <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                        {title}
                    </Text>
                </Pressable>
            </LinearGradient>
        )
    }

    return (
        <Pressable
            style={({pressed}) => ([
                buttonStyles.secondary,
                { opacity: pressed ? 0.8 : 1 },
                style ? style : {}
            ])}
            onPress={onPress}
        >
            <Text
                style={[
                    buttonStyles.text,
                    { color: textColor || appColors.text },
                ]}
            >
                {title}
            </Text>
        </Pressable>
    )
}

export default Button
