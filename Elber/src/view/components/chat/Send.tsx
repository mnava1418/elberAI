import React from 'react'
import { Pressable, View } from 'react-native'
import AppIcon from '../ui/AppIcon'
import chatStyles from '../../../styles/chat.style'
import { appColors } from '../../../styles/main.style'

type SendProps = {
    handleSend: () => void
}

const Send = ({handleSend}: SendProps) => {
    return (
        <Pressable
            style={({pressed}) => ([
                { opacity: pressed ? 0.8 : 1 },
            ])}
            onPress={handleSend}
        >
            <View style={chatStyles.send}>
                <AppIcon name='arrow-up' size={24} color={appColors.primary} />
            </View>
        </Pressable>
    )
}

export default Send