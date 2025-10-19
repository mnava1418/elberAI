import { Pressable, View } from 'react-native'
import { appColors } from '../../../styles/main.style'
import AppIcon from '../ui/AppIcon'

type TabIconProps = {
    icon: string,
    iconSelected: string,
    onPress: () => void
    isSelected?: boolean
}

const TabIcon = ({icon, iconSelected, onPress, isSelected = false}: TabIconProps) => {
    return (
        <Pressable 
            style={({pressed}) => ([
                {
                    opacity: pressed ? 0.8 : 1.0
                }
            ])}
            onPress={onPress}
        >
            <View>
                <AppIcon name={isSelected ? iconSelected : icon} size={34} color={isSelected ? appColors.contrast : appColors.subtitle}/>
            </View>
        </Pressable>
    )
}

export default TabIcon