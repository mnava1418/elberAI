import React from 'react'
import { View, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { appColors } from '../../../styles/main.style';
import useChat from '../../../hooks/chat/useChat';
import Send from './Send';
import chatStyles from '../../../styles/chat.style';
import { IMessage } from 'react-native-gifted-chat';

type InputToolBarProps = {
    sendMessage: (newMessage: IMessage[]) => void
}

const InputToolBar = ({sendMessage}: InputToolBarProps) => {
    const { 
        inputText, setInputText,
        animatedStyle 
    } = useChat()

    const handleSend = () => {
        if(inputText.trim() === '') {
            return
        }

        sendMessage([{
            _id: new Date().getTime(),
            text: inputText,
            createdAt: new Date().getTime(),
            user: {
                _id: 'user'
            }
        }])

        setInputText('')
    }

    return (
        <Animated.View id='inputToolBar' style={[{backgroundColor: appColors.primary, marginTop: 10}, animatedStyle]}>
            <View style={chatStyles.toolBar}>
                <TextInput style={chatStyles.inputText} 
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    keyboardType='default'
                    autoCapitalize='sentences'
                />  
                <Send handleSend={handleSend}/>
            </View>
        </Animated.View>
    )
}

export default InputToolBar