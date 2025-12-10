import React, { useContext, useRef } from 'react'
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native'
import chatStyles, { markdownStyle } from '../../../styles/chat.style'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectChatMessage } from '../../../store/actions/elber.actions'
import { ElberMessage } from '../../../store/reducers/elber.reducer'
import Markdown from 'react-native-markdown-display'

type ChatBubbleProps = {
    message: ElberMessage
    align: 'left' | 'right',
    setShowActions?: React.Dispatch<React.SetStateAction<boolean>>
    isStatic?: boolean
    style?: StyleProp<ViewStyle>
}

const ChatBubble = ({message, align, setShowActions, style = {}, isStatic = false}: ChatBubbleProps) => {
    const messageRef = useRef<View>(null)
    const { dispatch } = useContext(GlobalContext);

    const handleLongPress = () => {
        if (messageRef.current && setShowActions) {
            messageRef.current.measure((fx, fy, width, height, px, py) => {
                dispatch(selectChatMessage({
                    layout: {height, px, py, pv: align}, 
                    message
                }))
            })

            setShowActions(true)
        }
    }

    const generateElberMessage = ( 
        <View style={[{flexDirection: 'row', justifyContent: 'flex-start'}, style]}>
            <View ref={messageRef} style={[chatStyles.bubble, chatStyles.bubbleElber]}>
                <Markdown style={markdownStyle}>{message.content}</Markdown>
            </View>
        </View>
    )
    
    const generateUserMessage = (
        <View style={[{flexDirection: 'row', justifyContent: 'flex-end'}, style]}>
            <View ref={messageRef} style={[chatStyles.bubble, chatStyles.bubbleUser]}>
                <Text style={chatStyles.bubbleText}>{message.content}</Text>
            </View>
        </View>
    )

    if (isStatic) {
        return align == 'left' ? generateElberMessage : generateUserMessage;
    }

    return (
        <Pressable
            style={({pressed}) => ([
                {opacity: pressed ? 0.8 : 1.0}
            ])}
            onLongPress={handleLongPress}
        >
            {align === 'left' ? generateElberMessage : generateUserMessage}
        </Pressable>
    )
}

export default ChatBubble
