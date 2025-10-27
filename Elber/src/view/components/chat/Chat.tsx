import React, { useState } from 'react'
import { View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import InputToolBar from './InputToolBar';
import ChatBubble from './ChatBubble';
import ChatTime from './ChatTime';

const Chat = () => {
    const [messages, setMessages] = useState<IMessage[]>([])

    const sendMessage = (newMessage: IMessage[]) => {
        setMessages(GiftedChat.append(messages, newMessage));
    }

    return (
       <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
            <GiftedChat
                messages={messages}
                user={{ _id: 'user' }}
                renderInputToolbar={() => null}
                renderAvatar ={null}
                keyboardShouldPersistTaps="never"
                bottomOffset={0}
                isKeyboardInternallyHandled={false}
                renderBubble={ChatBubble}
                renderTime={ChatTime}
                showUserAvatar={false}
            />
            <InputToolBar sendMessage={sendMessage} />
        </View>
    );    
};

export default Chat;
