import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer'
import { Image, View } from 'react-native';
import CustomText from './CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import { ElberChat } from '../../../models/chat.model';
import sideMenuStyles from '../../../styles/sideMenu.style';
import { appColors } from '../../../styles/main.style';
import { GlobalContext } from '../../../store/GlobalProvider';
import { useContext } from 'react';
import { selectChat } from '../../../store/actions/chat.actions';

type SideMenuProps = {
    props: any,
    chatEntries: ElberChat[],
    selectedChatId: number,
}
const SideMenuContent = ({props, chatEntries, selectedChatId}: SideMenuProps) => {
    const { navigation, state } = props;
    const context = useContext(GlobalContext);
        
    const navigateToScreen = (screenName: string, params?: any) => {
        context.dispatch(selectChat(params?.id || -1))
        navigation.navigate(screenName, params);
    };

    const isActive = (routeName: string, chatId?: number) => {
        const activeRouteName = state.routes[state.index]?.name;

        return chatId ? chatId === selectedChatId : activeRouteName === routeName;
    };

    return (
        <DrawerContentScrollView {...props} style={sideMenuStyles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                <View style={sideMenuStyles.header} >
                    <Image 
                        source={require('../../../assets/images/elber.png')}
                        style={sideMenuStyles.logo}
                        resizeMode='contain'
                    />
                </View>
                <CustomText type='text' text='Elber' style={{fontSize: 20, fontWeight: '600'}} />
            </View>     

            <DrawerItem                
                label="Chat Nuevo"
                onPress={() => navigateToScreen('Chat Nuevo', {id: -1})}
                icon={({ focused, size }) => (
                    <Icon 
                        name="create-outline" 
                        size={size} 
                        color={appColors.subtitle} 
                    />
                )}
                labelStyle={sideMenuStyles.itemLabel}
                style={sideMenuStyles.item}
            />             

            {chatEntries.length > 0 ? <View style={sideMenuStyles.separator} /> : <></>}

            {chatEntries.map(chat=> {
                return(
                    <DrawerItem
                        key={chat.id}
                        label={chat.name ? chat.name : 'Chat Nuevo'}
                        onPress={() => navigateToScreen(chat.name ? chat.name : chat.id.toString(), {id: chat.id})}
                        icon={({ focused, size }) => (
                            <Icon 
                                name="chatbubbles-outline" 
                                size={size} 
                                color={isActive(chat.name ? chat.name : chat.id.toString(), chat.id) ? appColors.text : appColors.subtitle} 
                            />
                        )}
                        labelStyle={[sideMenuStyles.itemLabel, {color: isActive(chat.name ? chat.name : chat.id.toString(), chat.id) ? appColors.text : appColors.subtitle}]}
                        style={[sideMenuStyles.item, {backgroundColor: isActive(chat.name ? chat.name : chat.id.toString(), chat.id) ? appColors.secondary : 'transparent'}]}
                    />
                )
            })}

            <View style={sideMenuStyles.separator} />     
            
            <DrawerItem
                label="Ajustes"
                onPress={() => navigateToScreen('Ajustes')}
                icon={({ focused, size }) => (
                    <Icon 
                        name="settings-outline" 
                        size={size} 
                        color={isActive('Ajustes') ? appColors.text : appColors.subtitle} 
                    />
                )}
                labelStyle={[sideMenuStyles.itemLabel, {color: isActive("Ajustes") ? appColors.text : appColors.subtitle}]}
                style={[sideMenuStyles.item, {backgroundColor: isActive("Ajustes") ? appColors.secondary : 'transparent'}]}
            />                  
        </DrawerContentScrollView>
    );
}

export default SideMenuContent