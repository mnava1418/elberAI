import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const chatStyles = StyleSheet.create({
    btn: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 36, 
        width: 36, 
        borderRadius: 25,
        marginLeft: 8,
        marginBottom: 4
    },
    toolBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        margin: 12,
        backgroundColor: 'transparent',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: appColors.borderStrong,
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
        borderWidth: 1,
        borderColor: 'rgba(125,249,255,0.35)',
        overflow: 'hidden',
    },
    bubbleElber: {
        maxWidth: '90%',
        backgroundColor: appColors.panel,
        borderWidth: 1,
        borderColor: appColors.border,
    },
    bubbleText: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 24,
        color: appColors.text,
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