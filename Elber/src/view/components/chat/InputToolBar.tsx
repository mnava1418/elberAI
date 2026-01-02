import React, { useContext, useEffect } from 'react'
import { View, TextInput, FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { appColors } from '../../../styles/main.style';
import ChatBtn from './ChatBtn';
import chatStyles from '../../../styles/chat.style';
import { GlobalContext } from '../../../store/GlobalProvider';
import SocketModel from '../../../models/Socket.model';
import { isWaitingForElber } from '../../../store/actions/elber.actions';
import useElberStatus from '../../../hooks/chat/useElberStatus';
import useVoice from '../../../hooks/chat/useVoice';
import { selectChatInfo } from '../../../store/selectors/chat.selector';
import { ElberMessage } from '../../../models/chat.model';
import { addChatMessage } from '../../../store/actions/chat.actions';

type InputToolBarProps = {
    inputText: string
    setInputText: React.Dispatch<React.SetStateAction<string>>
    animatedStyle: { paddingBottom: number }
    flatListRef: React.RefObject<FlatList<any> | null>
}

const InputToolBar = ({inputText, setInputText, animatedStyle, flatListRef}: InputToolBarProps) => {
    const { state, dispatch } = useContext(GlobalContext);
    const chatInfo = selectChatInfo(state.chat)
    
    const { isStreaming, isWaiting } = useElberStatus(state.elber)
    const { 
        isListening, 
        startListening, 
        prepareSpeech, 
        removeSpeechListener, 
        stopListening 
    } = useVoice(dispatch, chatInfo.id, setInputText)

    const handleVoice = () => {
        if(isWaiting || isStreaming) {
            return
        }

        if(isListening) {
            stopListening()                
        } else {
            setInputText('')
            startListening()
        }
    }
    
    const handleSend = () => {
        if(chatInfo.messages.length >0) {
            flatListRef.current?.scrollToIndex({index: 0, animated: true})
        }
        
        if(inputText.trim() === '' || isWaiting || isStreaming) {
            return
        }

        const messageText = inputText.trim();        
        const timeStamp = Date.now()
        const newMessage: ElberMessage = {
            id: `user:${timeStamp}`,
            createdAt: timeStamp,
            role: 'user',
            content: messageText
        }

        let chatId = chatInfo.id
        let isNewChat = false

        if(chatInfo.id === -1) {
            chatId = Date.now()
            isNewChat = true
        }
        
        dispatch(isWaitingForElber(true))
        dispatch(addChatMessage(chatId, newMessage))
        
        SocketModel.getInstance().sendMessage(chatId, newMessage, isNewChat, dispatch)  
        setInputText('')
    }

    useEffect(() => {
        prepareSpeech()
            return () => {
                removeSpeechListener()
        }
    }, [])
    
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
                />  
                {inputText.trim() === '' && !isListening ? <ChatBtn type='secondary' icon='mic-outline' onPress={handleVoice} /> : <></>}
                {isListening ? <ChatBtn type='primary' icon='stop' onPress={handleVoice} /> : <></>}
                {inputText.trim() !== '' && !isListening ? <ChatBtn type='primary' icon='arrow-up' onPress={handleSend} /> : <></>}
            </View>
        </Animated.View>
    )
}

export default InputToolBar
