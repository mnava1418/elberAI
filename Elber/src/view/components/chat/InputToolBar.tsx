import React, { useContext } from 'react'
import { View, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { appColors } from '../../../styles/main.style';
import useChat from '../../../hooks/chat/useChat';
import Send from './Send';
import chatStyles from '../../../styles/chat.style';
import { IMessage } from 'react-native-gifted-chat';
import { GlobalContext } from '../../../store/GlobalProvider';
import SocketModel from '../../../models/Socket.model';
import { selectIsWaitingForElber } from '../../../store/selectors/elber.selector';
import { addChatMessage, isWaitingForElber } from '../../../store/actions/elber.actions';

const InputToolBar = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const isWaiting = selectIsWaitingForElber(state.elber)
    
    const { 
        inputText, setInputText,
        animatedStyle 
    } = useChat()

    const handleSend = () => {
        if(inputText.trim() === '' || isWaiting) {
            return
        }

        const timeStamp = new Date().getTime()
        const newMessage: IMessage = {
            _id: `user:${timeStamp}`,
            text: inputText,
            createdAt: timeStamp,
            user: {
                _id: 'user'
            }
        }

        dispatch(isWaitingForElber(true))
        dispatch(addChatMessage(newMessage))

        SocketModel.getInstance().sendMessage(inputText)

        setInputText('')
    }

    return (
        <Animated.View id='inputToolBar' style={[{backgroundColor: appColors.primary, marginTop: 10}, animatedStyle]}>
            <View style={chatStyles.toolBar}>
                <TextInput style={chatStyles.inputText} 
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    keyboardType='default'
                    autoCapitalize='sentences'
                    editable={!isWaiting}
                />  
                <Send icon={isWaiting ? 'ellipsis-horizontal' : 'arrow-up'} handleSend={handleSend}/>
            </View>
        </Animated.View>
    )
}

export default InputToolBar