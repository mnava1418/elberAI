import React, { useContext } from 'react'
import { View, TextInput, FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { appColors } from '../../../styles/main.style';
import Send from './Send';
import chatStyles from '../../../styles/chat.style';
import { GlobalContext } from '../../../store/GlobalProvider';
import SocketModel from '../../../models/Socket.model';
import { selectChatMessages, selectElberIsStreaming, selectIsWaitingForElber } from '../../../store/selectors/elber.selector';
import { addChatMessage, isWaitingForElber } from '../../../store/actions/elber.actions';
import { ElberMessage } from '../../../store/reducers/elber.reducer';
import { ElberAction } from '../../../models/elber.model';

type InputToolBarProps = {
    inputText: string
    setInputText: React.Dispatch<React.SetStateAction<string>>
    animatedStyle: { paddingBottom: number }
    flatListRef: React.RefObject<FlatList<any> | null>
}

const InputToolBar = ({inputText, setInputText, animatedStyle, flatListRef}: InputToolBarProps) => {
    const { state, dispatch } = useContext(GlobalContext);
    const isWaiting = selectIsWaitingForElber(state.elber)
    const isStreaming = selectElberIsStreaming(state.elber)
    const chatMessages = selectChatMessages(state.elber)
    
    const handleSend = () => {
        if(chatMessages.length >0) {
            flatListRef.current?.scrollToIndex({index: 0, animated: true})
        }
        
        if(isStreaming) {
            SocketModel.getInstance().cancelCall(ElberAction.CHAT_TEXT, dispatch)
            return
        }
        
        if(inputText.trim() === '' || isWaiting) {
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
                <Send handleSend={handleSend}/>
            </View>
        </Animated.View>
    )
}

export default InputToolBar