import React from 'react'
import { View } from 'react-native';
import InputToolBar from './InputToolBar';
import ChatGrid from './ChatGrid';
import ChatActions from './ChatActions';
import useChat from '../../../hooks/chat/useChat';

const Chat = () => {
    const {
        inputText, setInputText,
        showActions, setShowActions
    } = useChat()

    return (
       <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
            <ChatGrid setShowActions={setShowActions} />
            <InputToolBar inputText={inputText} setInputText={setInputText} />
            <ChatActions showActions={showActions} setShowActions={setShowActions} setInputText={setInputText} />
        </View>
    );    
};

export default Chat;
