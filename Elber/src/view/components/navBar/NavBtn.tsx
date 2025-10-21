import React from 'react'
import { Pressable } from 'react-native'
import AppIcon from '../ui/AppIcon'

interface NavBtnProps  {
    icon: string,
    onPress: () => void 
}

const NavBtn = ({icon, onPress}: NavBtnProps) => {
    return (
        <Pressable
            style={({pressed}) => ([
                {opacity: pressed ? 0.8 : 1.0}
                ]
            )}
            onPress={onPress}
        >
            <AppIcon name={icon} size={32} />
        </Pressable>
    )
}

export default NavBtn