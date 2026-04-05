import React, { useContext, useRef } from 'react'
import { View } from 'react-native';
import InputToolBar from './InputToolBar';
import ChatGrid from './ChatGrid';
import ChatActions from './ChatActions';
import VoiceSphere from './VoiceSphere';
import useChat from '../../../hooks/chat/useChat';
import { FlatList } from 'react-native';
import { GlobalContext } from '../../../store/GlobalProvider';
import useElberStatus from '../../../hooks/chat/useElberStatus';

const Chat = () => {
    const {
        inputText, setInputText,
        showActions, setShowActions,
        animatedStyle
    } = useChat()

    const { state } = useContext(GlobalContext)
    const { voiceMode, isWaiting, isTalking } = useElberStatus(state.elber)
    const flatListRef = useRef<FlatList>(null)

    return (
       <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
            <View style={{flex: 1}}>
                <ChatGrid setShowActions={setShowActions} flatListRef={flatListRef} />
                {voiceMode && <VoiceSphere isWaiting={isWaiting} isTalking={isTalking} />}
            </View>
            <InputToolBar inputText={inputText} setInputText={setInputText} animatedStyle={animatedStyle} flatListRef={flatListRef} />
            <ChatActions showActions={showActions} setShowActions={setShowActions} setInputText={setInputText} />
        </View>
    );
};

export default Chat;
