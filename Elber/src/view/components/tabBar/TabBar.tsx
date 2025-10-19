import { View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabIcon from './TabIcon';
import tabBarStyles from '../../../styles/tabBar.tyle';

interface TabBarProps extends BottomTabBarProps {
    showTabBar: boolean
}

const TabBar = ({state, navigation, showTabBar}: TabBarProps) => {
    const {bottom} = useSafeAreaInsets()

    return (
        <View style={[{ display: showTabBar ? 'flex' : 'none', paddingBottom: bottom + 8, }, tabBarStyles.container ]}>
            {state.routes.map((route, index) => {
                let icon = ''
                let iconSelected = ''
                const isSelected = state.index === index;

                switch (route.name) {
                    case 'Home':
                        icon = 'radio-button-off'
                        iconSelected = 'radio-button-on'
                        break;
                    case 'Chat':
                        icon = 'chatbubbles-outline'
                        iconSelected = 'chatbubbles'
                        break;
                    case 'Settings':
                        icon = 'cog-outline'
                        iconSelected = 'cog'
                        break;
                    default:
                        break;
                }

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
    
                    if (!isSelected && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                }

                return (
                    <TabIcon key={index} icon={icon} iconSelected={iconSelected} isSelected={isSelected} onPress={onPress} />
                )
            })}
        </View>
    )
}

export default TabBar