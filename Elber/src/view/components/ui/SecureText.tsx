import React, { useState } from 'react'
import { KeyboardTypeOptions, Pressable, TextInput, View } from 'react-native'
import inputStyles from '../../../styles/inputs.style'
import { appColors } from '../../../styles/main.style'
import AppIcon from './AppIcon'

type SecureTextProps = {
    text: string,
    placeholder?: string,
    keyboardType?: KeyboardTypeOptions | undefined
    handleOnChange: (arg0: string) => void
}

const SecureText = ({handleOnChange, text, placeholder = '', keyboardType = 'default'}: SecureTextProps) => {
    const [showText, setShowText] = useState(false)

    return (
        <View style={[{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}, inputStyles.inputView]}>
            <TextInput
                style={[inputStyles.text, {flex: 1, marginRight: 10}]}
                value={text}
                onChangeText={handleOnChange}
                keyboardType={keyboardType}
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
                <AppIcon name={ showText ? 'eye' : 'eye-off'} size={24} />
            </Pressable>
        </View>
    )
}

export default SecureText