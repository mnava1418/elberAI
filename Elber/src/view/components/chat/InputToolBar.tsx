import React, { useContext, useEffect } from 'react'
import { View, TextInput, FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { appColors } from '../../../styles/main.style';
import ChatBtn from './ChatBtn';
import chatStyles from '../../../styles/chat.style';
import { GlobalContext } from '../../../store/GlobalProvider';
import SocketModel from '../../../models/Socket.model';
import { selectChatMessages } from '../../../store/selectors/elber.selector';
import { addChatMessage, isWaitingForElber } from '../../../store/actions/elber.actions';
import { ElberMessage } from '../../../store/reducers/elber.reducer';
import useElberStatus from '../../../hooks/chat/useElberStatus';
import useVoice from '../../../hooks/chat/useVoice';

type InputToolBarProps = {
    inputText: string
    setInputText: React.Dispatch<React.SetStateAction<string>>
    animatedStyle: { paddingBottom: number }
    flatListRef: React.RefObject<FlatList<any> | null>
}

const InputToolBar = ({inputText, setInputText, animatedStyle, flatListRef}: InputToolBarProps) => {
    const { state, dispatch } = useContext(GlobalContext);
    const chatMessages = selectChatMessages(state.elber)
    const { isStreaming, isWaiting } = useElberStatus(state.elber)
    const { 
        isListening, 
        startListening, 
        prepareSpeech, 
        removeSpeechListener, 
        stopListening 
    } = useVoice(dispatch, setInputText)

    const handleVoice = () => {
        if(isListening.current) {
            stopListening()                
        } else {
            setInputText('')
            startListening()
        }
    }
    
    const handleSend = () => {
        if(chatMessages.length >0) {
            flatListRef.current?.scrollToIndex({index: 0, animated: true})
        }
        
        if(inputText.trim() === '' || isWaiting || isStreaming) {
            return
        }

        const messageText = inputText.trim();        
        const timeStamp = new Date().getTime()
        const newMessage: ElberMessage = {
            id: `user:${timeStamp}`,
            createdAt: timeStamp,
            role: 'user',
            content: messageText
        }

        dispatch(isWaitingForElber(true))
        dispatch(addChatMessage(newMessage))        

        SocketModel.getInstance().sendMessage([newMessage, ...chatMessages], dispatch)  
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
                    placeholder='Preguuuuntame caon...'
                    placeholderTextColor={appColors.subtitle}
                />  
                {inputText.trim() === '' ? <ChatBtn type='secondary' icon='mic-outline' onPress={handleVoice} /> : <></>}
                {inputText.trim() !== '' ? <ChatBtn type='primary' icon='arrow-up' onPress={handleSend} /> : <></>}
            </View>
        </Animated.View>
    )
}

export default InputToolBar
