import React, { useRef } from 'react'
import { View } from 'react-native';
import InputToolBar from './InputToolBar';
import ChatGrid from './ChatGrid';
import ChatActions from './ChatActions';
import useChat from '../../../hooks/chat/useChat';
import { FlatList } from 'react-native';

const Chat = () => {
    const {
        inputText, setInputText,
        showActions, setShowActions,
        animatedStyle
    } = useChat()

    const flatListRef = useRef<FlatList>(null)

    return (
       <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
            <ChatGrid setShowActions={setShowActions} flatListRef={flatListRef} />
            <InputToolBar inputText={inputText} setInputText={setInputText} animatedStyle={animatedStyle} flatListRef={flatListRef} />
            <ChatActions showActions={showActions} setShowActions={setShowActions} setInputText={setInputText} />
        </View>
    );    
};

export default Chat;
