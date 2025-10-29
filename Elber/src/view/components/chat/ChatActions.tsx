import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Modal, Pressable, StyleProp, View, ViewStyle } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import Share from 'react-native-share';
import { GlobalContext } from '../../../store/GlobalProvider';
import { selectSelectedChatMessage } from '../../../store/selectors/elber.selector';
import { mainStyles } from '../../../styles/main.style';
import ChatActionItem from './ChatActionItem';
import chatStyles from '../../../styles/chat.style';

type ChatActionsProps = {
    showActions: boolean,
    setShowActions: React.Dispatch<React.SetStateAction<boolean>>
    setInputText: React.Dispatch<React.SetStateAction<string>>
}

const screenHeight = Dimensions.get('window').height

const ChatActions = ({showActions, setShowActions, setInputText}: ChatActionsProps) => {
    const { state } = useContext(GlobalContext);
    const selectedMessage = selectSelectedChatMessage(state.elber)
    const [customStyle, setCustomStyle] = useState<StyleProp<ViewStyle>>({})

    useEffect(() => {
        if(showActions && selectedMessage) {            
            const ALERTA_HEIGHT = 120
            const messageLayout = selectedMessage.layout
            const spaceAbove = messageLayout.py
            const spaceBelow = screenHeight - (messageLayout.py + messageLayout.height)
            const showAbove = spaceBelow < ALERTA_HEIGHT && spaceAbove >= ALERTA_HEIGHT
            let top = showAbove ? messageLayout.py - ALERTA_HEIGHT : messageLayout.py + messageLayout.height
            top = top + 8
            
            if(messageLayout.pv === 'left') {
                setCustomStyle({position: 'absolute', top, left: 24})
            } else {
                setCustomStyle({position: 'absolute', top, right: 24})
            }            
        }
    }, [selectedMessage])

    const handleCopy = () => {
        Clipboard.setString(selectedMessage!.message.text)
        setShowActions(false)
    }

    const handleShare = async () => {
        await Share.open({
            message: selectedMessage!.message.text
        })
        .catch((error: Error) => {            
        })
        setShowActions(false)
    }

    const handleEdit = () => {
        setInputText(selectedMessage!.message.text)
        setShowActions(false)
    }

    return (
        <>
            {selectedMessage ? (
                <Modal transparent={true} visible={showActions} animationType="fade">
                    <Pressable style={{flex: 1}} onPress={() => {setShowActions(false)}}>
                        <View style={mainStyles.modal}>
                            <View style={[customStyle, chatStyles.actionsContainer]}>
                                <ChatActionItem text='Compartir' icon='share-outline' handleAction={handleShare} />
                                <ChatActionItem text='Copiar' icon='copy-outline' handleAction={handleCopy} marginTop={10} />
                                {selectedMessage.message.user._id == 'user' ? <ChatActionItem text='Editar' icon='create-outline' handleAction={handleEdit} marginTop={10} /> : <></>}
                            </View>
                        </View>
                    </Pressable>
                </Modal>
            ) 
            : (<></>)}
        </>
    )
}

export default ChatActions
