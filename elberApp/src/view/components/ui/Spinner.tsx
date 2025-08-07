import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { appColors } from '../../../styles/main.style'

const Spinner = () => {
  return (
    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 24}}>
        <ActivityIndicator size={'large'} color={appColors.subtitle} />
    </View>
  )
}

export default Spinner