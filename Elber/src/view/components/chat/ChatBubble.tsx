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
                    ...chatStyles.bubble,
                    ...chatStyles.bubbleRight
                },
                left: {
                    ...chatStyles.bubble,
                    ...chatStyles.bubbleLeft
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