import React, { useContext } from 'react'
import { FlatList, View } from 'react-native'
import { selectChatMessages } from '../../../store/selectors/elber.selector'
import { GlobalContext } from '../../../store/GlobalProvider';
import ChatBubble from './ChatBubble';

const ChatGrid = () => {
    const { state } = useContext(GlobalContext);
    const chatMessages = selectChatMessages(state.elber)

    return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
            <FlatList 
                inverted
                data={chatMessages}
                renderItem={({item, index}) => (
                    <ChatBubble key={index} align={item.user._id == 'elber' ? 'left' : 'right'} message={item} />
                )}
                contentContainerStyle={{paddingHorizontal: 10}}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default ChatGrid