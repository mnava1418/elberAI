import React, { useContext, useRef } from 'react'
import { IMessage } from 'react-native-gifted-chat'
import { Pressable, Text, View } from 'react-native'
import { appColors } from '../../../styles/main.style'
import chatStyles from '../../../styles/chat.style'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectChatMessage } from '../../../store/actions/elber.actions'

type ChatBubbleProps = {
    message: IMessage
    align: 'left' | 'right',
    setShowActions: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatBubble = ({message, align, setShowActions}: ChatBubbleProps) => {
    const messageRef = useRef<View>(null)
    const { dispatch } = useContext(GlobalContext);

    const handleLongPress = () => {
        if (messageRef.current) {
            messageRef.current.measure((fx, fy, width, height, px, py) => {
                dispatch(selectChatMessage({
                    layout: {height, px, py, pv: align}, 
                    message
                }))
            })

            setShowActions(true)
        }
    }

    return (
        <Pressable
            style={({pressed}) => ([
                {opacity: pressed ? 0.8 : 1.0}
            ])}
            onLongPress={handleLongPress}
        >
            <View style={{flexDirection: 'row', justifyContent: align == 'left' ? 'flex-start' : 'flex-end'}}>
                <View ref={messageRef} style={[chatStyles.bubble, {backgroundColor: align == 'left' ? appColors.secondary : appColors.contrast}]}>
                    <Text style={[chatStyles.bubbleText, {color: align == 'left' ? appColors.text : appColors.primary}]}>{message.text}</Text>
                </View>
            </View>
        </Pressable>
    )
}

export default ChatBubble
