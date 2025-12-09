import { StyleSheet } from "react-native"

export const appColors = {
    primary: '#000',
    secondary: '#2b2b2b',
    contrast: '#FFFFFF',
    text: '#fff',
    subtitle: '#A0A0A0',
    error: '#FF0000'
}

export const mainStyles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }
})