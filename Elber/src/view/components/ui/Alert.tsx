import React, { useContext } from 'react'
import { Modal, Pressable, View } from 'react-native'
import CustomText from './CustomText'
import Button from './Button'
import { GlobalContext } from '../../../store/GlobalProvider'
import { selectAlert } from '../../../store/selectors/elber.selector'
import { hideAlert } from '../../../store/actions/elber.actions'
import alertStyles from '../../../styles/alert.style'

const Alert = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const { isVisible, title, text, btnText, onPress } = selectAlert(state.elber)
    
    return (
        <Modal transparent={true} visible={isVisible} animationType='fade'>
            <Pressable style={{flex: 1}} onPress={() => {dispatch(hideAlert())}}>
                <View style={alertStyles.modal}>
                    <View style={alertStyles.container}>
                        <CustomText type='title' text={title} style={{fontSize: 24}} />
                        <CustomText type='text' text={text} style={alertStyles.text} />
                        <Button title={btnText} type='primary' onPress={onPress} />
                    </View>
                </View>
            </Pressable>
        </Modal>
    )
}

export default Alert