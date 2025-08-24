import Icon from 'react-native-vector-icons/Ionicons'
import React from 'react'
import { appColors } from '../../../styles/main.style'

type AppIconPros = {
    name: string,
    color?: string,
    size?: number
}

const AppIcon = ({name, color = appColors.text, size = 40}: AppIconPros) => {
    return (
        <Icon name={name} color={color} size={size} />
    )
}

export default AppIcon