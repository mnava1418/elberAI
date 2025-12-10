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
    },
    inputText: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        fontSize: 18,
        fontWeight: '400',
        color: appColors.text,
        paddingHorizontal: 8,
        paddingVertical: 12
    },
    bubble: {
        borderRadius: 15,
        marginBottom: 20,
        padding: 10,
    },
    bubbleUser: {
        maxWidth: '65%',
        backgroundColor: appColors.contrast
    },
    bubbleElber: {
        maxWidth: '90%',
        backgroundColor: appColors.secondary
    },
    bubbleText: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 24,
        color: appColors.primary
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

export const markdownStyle: StyleSheet.NamedStyles<any> = {
    body: { 
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 28,
        color: appColors.text
    },
    code_block: { 
        backgroundColor: appColors.primary, 
        color: appColors.text, 
        padding: 10, 
        borderRadius: 15, 
        borderWidth: 0,
        fontSize: 16,
        lineHeight: 22,
    },
    fence: { 
        backgroundColor: appColors.primary, 
        color: appColors.text, 
        padding: 10, 
        borderRadius: 15, 
        borderWidth: 0,
        fontSize: 16,
        lineHeight: 22,
    },
    heading1: { 
        fontSize: 24, 
        fontWeight: 'bold' 
    },
}; 

export default chatStyles