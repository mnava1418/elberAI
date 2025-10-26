import React, { useState } from 'react'
import { View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import InputToolBar from './InputToolBar';

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
                keyboardShouldPersistTaps="never"
                bottomOffset={0}
                isKeyboardInternallyHandled={false}
            />
            <InputToolBar sendMessage={sendMessage} />
        </View>
    );    
};

export default Chat;
