import { Pressable, View } from 'react-native'
import { appColors } from '../../../styles/main.style'
import AppIcon from '../ui/AppIcon'
import CustomText from '../ui/CustomText'

type TabIconProps = {
    icon: string,
    iconSelected: string,
    title: string,
    onPress: () => void
    isSelected?: boolean
}

const TabIcon = ({icon, iconSelected, onPress, title, isSelected = false}: TabIconProps) => {
    return (
        <Pressable 
            style={({pressed}) => ([
                {
                    opacity: pressed ? 0.8 : 1.0
                }
            ])}
            onPress={onPress}
        >
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <AppIcon name={isSelected ? iconSelected : icon} size={34} color={isSelected ? appColors.contrast : appColors.subtitle}/>
                <CustomText type='text' text={title} style={{color: isSelected ? appColors.contrast : appColors.subtitle, fontSize: 14}} />
            </View>
        </Pressable>
    )
}

export default TabIcon