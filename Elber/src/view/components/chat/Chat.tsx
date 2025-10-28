import React, { useContext } from 'react'
import { View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import InputToolBar from './InputToolBar';
import ChatBubble from './ChatBubble';
import ChatTime from './ChatTime';
import { GlobalContext } from '../../../store/GlobalProvider';
import { selectChatMessages, selectIsWaitingForElber } from '../../../store/selectors/elber.selector';

const Chat = () => {
    const { state } = useContext(GlobalContext);
    const isWaiting = selectIsWaitingForElber(state.elber)
    const chatMessages = selectChatMessages(state.elber)
    
    return (
       <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
            <GiftedChat
                messages={chatMessages}
                user={{ _id: 'user' }}
                renderInputToolbar={() => null}
                renderAvatar ={null}
                keyboardShouldPersistTaps="never"
                bottomOffset={0}
                isKeyboardInternallyHandled={false}
                renderBubble={ChatBubble}
                renderTime={ChatTime}
                showUserAvatar={false}
                isTyping={isWaiting}
                messagesContainerStyle={{
                    paddingHorizontal: 10
                }}
            />
            <InputToolBar />
        </View>
    );    
};

export default Chat;
