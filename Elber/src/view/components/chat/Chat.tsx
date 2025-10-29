import React from 'react'
import { View } from 'react-native';
import InputToolBar from './InputToolBar';
import ChatGrid from './ChatGrid';

const Chat = () => {
    return (
       <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
            <ChatGrid />
            <InputToolBar />
        </View>
    );    
};

export default Chat;
