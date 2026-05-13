import React from 'react'
import { Pressable, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
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
            {type === 'primary' ? (
                <LinearGradient
                    colors={[appColors.cyan, appColors.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[chatStyles.btn]}
                >
                    <AppIcon name={icon} size={20} color={appColors.primary} />
                </LinearGradient>
            ) : (
                <View style={[chatStyles.btn, {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: appColors.borderStrong,
                }]}>
                    <AppIcon name={icon} size={20} color={appColors.dim} />
                </View>
            )}
        </Pressable>
    )
}

export default ChatBtn
