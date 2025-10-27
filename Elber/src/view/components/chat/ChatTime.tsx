import React from 'react'
import { IMessage, Time, TimeProps } from 'react-native-gifted-chat'
import { appColors } from '../../../styles/main.style'

const ChatTime = (props: TimeProps<IMessage>) => {
    return (
        <Time
            {...props}
            timeTextStyle={{
                left: {
                    color: appColors.text
                    
                },
                right: {
                    color: appColors.primary
                }
            }}
        />
    )
}

export default ChatTime