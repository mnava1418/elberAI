import React, { useContext } from 'react'
import { FlatList, View } from 'react-native'
import { selectChatMessages, selectIsWaitingForElber } from '../../../store/selectors/elber.selector'
import { GlobalContext } from '../../../store/GlobalProvider';
import ChatBubble from './ChatBubble';
import IsWaiting from './IsWaiting';

const ChatGrid = () => {
    const { state } = useContext(GlobalContext);
    const chatMessages = selectChatMessages(state.elber)
    const isWaiting = selectIsWaitingForElber(state.elber)

    return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end', paddingHorizontal: 10}}>
            <FlatList 
                inverted
                data={chatMessages}
                renderItem={({item, index}) => (
                    <ChatBubble key={index} align={item.user._id == 'elber' ? 'left' : 'right'} message={item} />
                )}                
                showsVerticalScrollIndicator={false}
            />           
            {isWaiting ? <IsWaiting /> : <></>}
        </View>
    )
}

export default ChatGrid
