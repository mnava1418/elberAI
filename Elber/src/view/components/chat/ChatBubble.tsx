import React from 'react'
import { Bubble, BubbleProps, IMessage } from 'react-native-gifted-chat'
import { appColors } from '../../../styles/main.style'
import chatStyles from '../../../styles/chat.style'

const ChatBubble = (props: BubbleProps<IMessage>) => {
    return (
        <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: appColors.contrast,
                    ...chatStyles.bubble,
                },
                left: {
                    backgroundColor: appColors.secondary,
                    ...chatStyles.bubble,
                }
            }}
            textStyle={{
                right: {
                    color: appColors.primary,
                    ...chatStyles.bubbleText
                },
                left: {
                    color: appColors.text,
                    ...chatStyles.bubbleText
                }
            }}
        />
    )
}

export default ChatBubble