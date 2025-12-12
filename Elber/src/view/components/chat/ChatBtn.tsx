import React from 'react'
import { Pressable, View } from 'react-native'
import AppIcon from '../ui/AppIcon'
import chatStyles from '../../../styles/chat.style'
import { appColors } from '../../../styles/main.style'

type ChatBtnProps = {
    type: 'primary' | 'secondary'   
    icon: string 
    onPress: () => void
}

const ChatBtn = ({type, icon, onPress}: ChatBtnProps) => {
    return (
        <Pressable
            style={({pressed}) => ([
                { opacity: pressed ? 0.8 : 1 },
            ])}
            onPress={onPress}
        >
            <View style={[chatStyles.btn, {backgroundColor: type == 'primary' ? appColors.contrast : appColors.secondary}]}>
                <AppIcon name={icon} size={24} color={type == 'primary' ? appColors.primary : appColors.subtitle} />
            </View>
        </Pressable>
    )
}

export default ChatBtn