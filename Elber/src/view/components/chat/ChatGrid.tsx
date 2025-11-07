import React, { useContext } from 'react'
import { FlatList, View } from 'react-native'
import { selectChatMessages, selectIsWaitingForElber } from '../../../store/selectors/elber.selector'
import { GlobalContext } from '../../../store/GlobalProvider';
import ChatBubble from './ChatBubble';
import IsWaiting from './IsWaiting';

type ChatGridProps = {
    setShowActions: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatGrid = ({setShowActions}: ChatGridProps) => {
    const { state } = useContext(GlobalContext);
    const chatMessages = selectChatMessages(state.elber)
    const isWaiting = selectIsWaitingForElber(state.elber)
    

    return (
        <>
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end', paddingHorizontal: 10}}>
                <FlatList 
                    inverted
                    data={chatMessages}
                    renderItem={({item, index}) => (
                        <ChatBubble key={index} align={item.role == 'assistant' ? 'left' : 'right'} message={item} setShowActions={setShowActions} />
                    )}                
                    showsVerticalScrollIndicator={false}
                />           
                {isWaiting ? <IsWaiting /> : <></>}
            </View>            
        </>
    )
}

export default ChatGrid
