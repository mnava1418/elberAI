import React, { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import inputStyles from '../../../styles/inputs.style'
import { appColors } from '../../../styles/main.style'
import AppIcon from './AppIcon'

type SecureTextProps = {
    text: string,
    placeholder?: string
    handleOnChange: (arg0: string) => void
}

const SecureText = ({handleOnChange, text, placeholder = ''}: SecureTextProps) => {
    const [showText, setShowText] = useState(false)

    return (
        <View style={[{flexDirection: 'row', backgroundColor: 'red', justifyContent: 'center', alignItems: 'center'},inputStyles.inputView]}>
            <TextInput
                style={[inputStyles.text, {flex: 1, marginRight: 10}]}
                value={text}
                onChangeText={handleOnChange}
                keyboardType='default'
                autoCapitalize='none'
                placeholder={placeholder}
                placeholderTextColor={appColors.subtitle}
                secureTextEntry={!showText}
            />
            <Pressable
                style={({pressed}) => ([
                    {opacity: pressed ? 0.8 : 1.0}
                    ]
                )}
                onPress={() => {setShowText(prev => !prev)}}
            >
                <AppIcon name={ showText ? 'eye' : 'eye-off'} size={28} />
            </Pressable>
        </View>
    )
}

export default SecureText