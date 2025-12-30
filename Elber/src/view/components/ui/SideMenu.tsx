import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer'
import { Image, View } from 'react-native';
import CustomText from './CustomText';
import Icon from 'react-native-vector-icons/Ionicons';
import { ElberChat } from '../../../models/chat.model';
import sideMenuStyles from '../../../styles/sideMenu.style';
import { appColors } from '../../../styles/main.style';

type SideMenuProps = {
    props: any,
    elberChats: Map<number, ElberChat>
}
const SideMenuContent = ({props, elberChats}: SideMenuProps) => {
    const { navigation, state } = props;
        
    const navigateToScreen = (screenName: string, params?: any) => {
        navigation.navigate(screenName, params);
    };

    const isActive = (routeName: string) => {
        const activeRouteName = state.routes[state.index]?.name;
        return activeRouteName === routeName;
    };

    const chatEntries = Array.from(elberChats.values())

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

            <View style={sideMenuStyles.separator} />                     

            {chatEntries.map(chat=> {
                return(
                    <DrawerItem
                        key={chat.id}
                        label={chat.name}
                        onPress={() => navigateToScreen(chat.name, {id: chat.id})}
                        icon={({ focused, size }) => (
                            <Icon 
                                name="chatbubbles-outline" 
                                size={size} 
                                color={isActive(chat.name) ? appColors.text : appColors.subtitle} 
                            />
                        )}
                        labelStyle={[sideMenuStyles.itemLabel, {color: isActive(chat.name) ? appColors.text : appColors.subtitle}]}
                        style={[sideMenuStyles.item, {backgroundColor: isActive(chat.name) ? appColors.secondary : 'transparent'}]}
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