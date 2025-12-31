import React, { useContext } from 'react'
import { FlatList, View } from 'react-native'
import { selectIsWaitingForElber } from '../../../store/selectors/elber.selector'
import { GlobalContext } from '../../../store/GlobalProvider';
import ChatBubble from './ChatBubble';
import IsWaiting from './IsWaiting';
import { selectChatInfo } from '../../../store/selectors/chat.selector';

type ChatGridProps = {
    setShowActions: React.Dispatch<React.SetStateAction<boolean>>
    flatListRef: React.RefObject<FlatList<any> | null>
}

const ChatGrid = ({setShowActions, flatListRef}: ChatGridProps) => {
    const { state } = useContext(GlobalContext);
    const chatInfo = selectChatInfo(state.chat)
    const isWaiting = selectIsWaitingForElber(state.elber)
    
    return (
        <>
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end', paddingHorizontal: 10}}>
                <FlatList 
                    inverted
                    ref={flatListRef}
                    data={chatInfo.messages}
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
