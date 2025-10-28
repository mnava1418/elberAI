import React, { useContext } from 'react'
import { View, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { appColors } from '../../../styles/main.style';
import useChat from '../../../hooks/chat/useChat';
import Send from './Send';
import chatStyles from '../../../styles/chat.style';
import { IMessage } from 'react-native-gifted-chat';
import { GlobalContext } from '../../../store/GlobalProvider';
import { isWaitingForElber } from '../../../store/actions/user.actions';
import { selectIsWaitingForElber } from '../../../store/selectors/user.selector';

type InputToolBarProps = {
    sendMessage: (newMessage: IMessage[]) => void
}

const InputToolBar = ({sendMessage}: InputToolBarProps) => {
    const { state, dispatch } = useContext(GlobalContext);
    const isWaiting = selectIsWaitingForElber(state.user)

    const { 
        inputText, setInputText,
        animatedStyle 
    } = useChat()

    const handleSend = () => {
        if(inputText.trim() === '' || isWaiting) {
            return
        }

        dispatch(isWaitingForElber(true))

        sendMessage([{
            _id: new Date().getTime(),
            text: inputText,
            createdAt: new Date().getTime(),
            user: {
                _id: 'user'
            }
        }])

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