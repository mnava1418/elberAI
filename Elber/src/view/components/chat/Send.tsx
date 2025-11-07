import React, { useContext } from 'react'
import { Pressable, View } from 'react-native'
import AppIcon from '../ui/AppIcon'
import chatStyles from '../../../styles/chat.style'
import { appColors } from '../../../styles/main.style'
import { selectElberIsStreaming, selectIsWaitingForElber } from '../../../store/selectors/elber.selector'
import { GlobalContext } from '../../../store/GlobalProvider'

type SendProps = {    
    handleSend: () => void
}

const Send = ({handleSend}: SendProps) => {
    const { state } = useContext(GlobalContext);
    const isWaiting = selectIsWaitingForElber(state.elber)
    const isStreaming = selectElberIsStreaming(state.elber)

    return (
        <Pressable
            style={({pressed}) => ([
                { opacity: pressed ? 0.8 : 1 },
            ])}
            onPress={handleSend}
        >
            <View style={chatStyles.send}>
                <AppIcon name={isWaiting || isStreaming ? 'square' : 'arrow-up'} size={24} color={appColors.primary} />
            </View>
        </Pressable>
    )
}

export default Send