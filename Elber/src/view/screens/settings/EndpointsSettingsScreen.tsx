import React from 'react'
import MainView from '../../components/ui/MainView'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from './SettingsNavigator';

type EndpointsSettingsProps = NativeStackScreenProps<SettingsStackParamList, 'EndpointsSettings'>;

const EndpointsSettingsScreen = ({navigation}: EndpointsSettingsProps) => {
  return (
    <MainView navBarTitle='Endpoints' leftAction={() => {navigation.goBack()}}>
    </MainView>
  )
}

export default EndpointsSettingsScreen