import React from 'react'
import { IMessage } from 'react-native-gifted-chat'
import { Pressable, Text, View } from 'react-native'
import { appColors } from '../../../styles/main.style'
import chatStyles from '../../../styles/chat.style'

type ChatBubbleProps = {
    message: IMessage
    align: 'left' | 'right'
}

const ChatBubble = ({message, align}: ChatBubbleProps) => {
    return (
        <Pressable
            style={({pressed}) => ([
                {opacity: pressed ? 0.8 : 1.0}
            ])}
        >
            <View style={{flex: 1, flexDirection: 'row', justifyContent: align == 'left' ? 'flex-start' : 'flex-end'}}>
                <View style={[chatStyles.bubble, {backgroundColor: align == 'left' ? appColors.secondary : appColors.contrast}]}>
                    <Text style={[chatStyles.bubbleText, {color: align == 'left' ? appColors.text : appColors.primary}]}>{message.text}</Text>
                </View>
            </View>
        </Pressable>
    )
}

export default ChatBubble
