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
        marginLeft: 8
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
        minHeight: 36,
        maxHeight: 120,
        fontSize: 18,
        fontWeight: '500',
        color: appColors.text,
        paddingHorizontal: 8,
        paddingVertical: 8
    }
})

export default chatStyles