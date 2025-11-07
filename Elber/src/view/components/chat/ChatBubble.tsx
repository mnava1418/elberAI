import React, { useContext, useRef } from 'react'
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native'
import { appColors } from '../../../styles/main.style'
import chatStyles from '../../../styles/chat.style'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectChatMessage } from '../../../store/actions/elber.actions'
import { ElberMessage } from '../../../store/reducers/elber.reducer'

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

    const bubbleContent = (
        <View style={[{flexDirection: 'row', justifyContent: align == 'left' ? 'flex-start' : 'flex-end'}, style]}>
            <View ref={messageRef} style={[chatStyles.bubble, {backgroundColor: align == 'left' ? appColors.secondary : appColors.contrast}]}>
                <Text style={[chatStyles.bubbleText, {color: align == 'left' ? appColors.text : appColors.primary}]}>{message.content}</Text>
            </View>
        </View>
    );

    if (isStatic) {
        return bubbleContent;
    }

    return (
        <Pressable
            style={({pressed}) => ([
                {opacity: pressed ? 0.8 : 1.0}
            ])}
            onLongPress={handleLongPress}
        >
            {bubbleContent}
        </Pressable>
    )
}

export default ChatBubble
