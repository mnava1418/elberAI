import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const chatStyles = StyleSheet.create({
    send: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 36, 
        width: 36, 
        backgroundColor: appColors.contrast,
        borderRadius: 25,
        marginLeft: 8,
        marginBottom: 4
    },
    toolBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        margin: 12,
        backgroundColor: appColors.secondary,
        borderRadius: 25,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    inputText: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        fontSize: 18,
        fontWeight: '400',
        color: appColors.text,
        paddingHorizontal: 8,
        paddingVertical: 12
    },
    bubble: {
        borderRadius: 15,
        maxWidth: '90%',
        marginBottom: 16,
        padding: 10
    },
    bubbleText: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 28
    },
    actionsContainer: {
        borderRadius: 15, 
        width: 250, 
        padding: 20, 
        backgroundColor: appColors.secondary
    },
    action: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%',
    }
})

export default chatStyles