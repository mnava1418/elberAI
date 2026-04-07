import React, { useCallback, useContext, useEffect } from 'react'
import { View, TextInput, FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { appColors } from '../../../styles/main.style';
import ChatBtn from './ChatBtn';
import chatStyles from '../../../styles/chat.style';
import { GlobalContext } from '../../../store/GlobalProvider';
import SocketModel from '../../../models/Socket.model';
import { elberIsTalking, isWaitingForElber, setVoiceMode } from '../../../store/actions/elber.actions';
import useElberStatus from '../../../hooks/chat/useElberStatus';
import useVoice from '../../../hooks/chat/useVoice';
import { selectChatInfo } from '../../../store/selectors/chat.selector';
import { ElberMessage } from '../../../models/chat.model';
import { addChatMessage } from '../../../store/actions/chat.actions';
import AudioQueue from '../../../models/AudioQueue.model';

type InputToolBarProps = {
    inputText: string
    setInputText: React.Dispatch<React.SetStateAction<string>>
    animatedStyle: { paddingBottom: number }
    flatListRef: React.RefObject<FlatList<any> | null>
}

const InputToolBar = ({inputText, setInputText, animatedStyle, flatListRef}: InputToolBarProps) => {
    const { state, dispatch } = useContext(GlobalContext);
    const chatInfo = selectChatInfo(state.chat)
    const { isStreaming, isWaiting, voiceMode, isTalking } = useElberStatus(state.elber)
    
    const handleOnEnd = useCallback((text: string, isFinal: boolean) => {
        setInputText(text)
        if(voiceMode && isFinal) {
            handleSend(text)
        }
    }, [voiceMode])

    const { 
        isListening, 
        startListening, 
        prepareSpeech, 
        removeSpeechListener, 
        stopListening 
    } = useVoice(dispatch, chatInfo.id, handleOnEnd, inputText)

    const handleVoice = () => {
        if(isWaiting || isStreaming || isTalking) {
            return
        }

        if(isListening) {
            stopListening()                
        } else {
            startListening()
        }
    }

    const handleSend = (text: string) => {
        if(chatInfo.messages.length >0) {
            flatListRef.current?.scrollToIndex({index: 0, animated: true})
        }
        
        if(text.trim() === '' || isWaiting || isStreaming || isTalking) {
            return
        }

        const messageText = text.trim();        
        const timeStamp = Date.now()
        const newMessage: ElberMessage = {
            id: `user:${timeStamp}`,
            createdAt: timeStamp,
            role: 'user',
            content: messageText
        }

        const chatId = chatInfo.id === -1 ? Date.now() : chatInfo.id
        
        dispatch(isWaitingForElber(true))
        dispatch(addChatMessage(chatId, newMessage))
        
        SocketModel.getInstance().sendMessage(chatId, chatInfo.name!, newMessage, voiceMode, dispatch)  
        setInputText('')
    }

    const handleCancel = () => {
        if(voiceMode && isTalking) {
            dispatch(elberIsTalking(false))
            AudioQueue.getInstance().stop()
        }
        
        SocketModel.getInstance().cancelMessage(chatInfo.id, dispatch)
    }

    const handleToggleVoiceMode = () => {
        if(isWaiting || isStreaming || isTalking) {
            return
        }

        if(!voiceMode && !isListening) {
            handleVoice()
        }

        dispatch(setVoiceMode(!voiceMode))
    }

    useEffect(() => {
        prepareSpeech()
            return () => {
                removeSpeechListener()
        }
    }, [handleOnEnd])
    
    return (
        <Animated.View id='inputToolBar' style={[{backgroundColor: appColors.primary, marginTop: 10}, animatedStyle]}>
            <View style={chatStyles.toolBar}>
                <TextInput 
                    style={chatStyles.inputText} 
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    keyboardType='default'
                    autoCapitalize='sentences'
                    placeholder={isListening ? 'Escuchando...' : 'Preguuuuntame caon...'}
                    placeholderTextColor={appColors.subtitle}
                    editable={!isStreaming && ! isTalking}
                />  
                {!isTalking && !isStreaming ? <ChatBtn type={isListening ? 'primary' : 'secondary'} icon={isListening ? 'mic-off-outline' : 'mic-outline'} onPress={handleVoice} /> : <></>}
                {inputText.trim() !== '' && !isListening && !isStreaming && !isTalking ? <ChatBtn type='primary' icon='arrow-up' onPress={() => {handleSend(inputText)}} /> : <></>}
                {isStreaming || isTalking ? <ChatBtn type='primary' icon='stop' onPress={handleCancel} /> : <></>}
                {!isStreaming && !isTalking && !isWaiting ? <ChatBtn type={voiceMode ? 'primary' : 'secondary'} icon='radio-outline' onPress={handleToggleVoiceMode} /> : <></>}
            </View>
        </Animated.View>
    )
}

export default InputToolBar
