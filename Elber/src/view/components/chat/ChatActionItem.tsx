import React from 'react'
import { Pressable, Text, View } from 'react-native'
import AppIcon from '../ui/AppIcon'
import chatStyles from '../../../styles/chat.style'
import { appColors } from '../../../styles/main.style'

type ChatActionItemProps = {
    text: string
    icon: string    
    handleAction: () => void
    marginTop?: number
}

const ChatActionItem = ({text, icon, handleAction, marginTop = 0}: ChatActionItemProps) => {
    return (
        <Pressable
            style={({pressed}) => ({opacity: pressed ? 0.8 : 1.0})}
            onPress={handleAction}
        >
            <View style={[chatStyles.action,{marginTop: marginTop}]}>
                <Text style={[chatStyles.bubbleText, {color: appColors.text}]}>{text}</Text>
                <AppIcon name={icon} size={24} />
            </View>
        </Pressable>
    )
}

export default ChatActionItem