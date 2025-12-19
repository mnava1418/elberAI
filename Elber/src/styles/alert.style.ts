import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const alertStyles = StyleSheet.create({
    modal: {
        flex: 1, 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.6)'
    },

    container: {
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        maxWidth: '80%', 
        backgroundColor: appColors.secondary, 
        padding: 24, 
        borderRadius: 25
    },

    text: {
        color: appColors.subtitle, 
        textAlign: 'center', 
        marginTop: 8, 
        marginBottom: 24
    }
})

export default alertStyles