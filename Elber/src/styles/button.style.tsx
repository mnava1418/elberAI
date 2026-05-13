import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const buttonStyles = StyleSheet.create({
    primary: {
        borderRadius: 50,
        width: '100%',
        marginVertical: 12,
        overflow: 'hidden',
        margin: 8,
    },
    gradient: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondary: {
        backgroundColor: 'transparent',
        margin: 0,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    primaryText: {
        color: appColors.primary,
    },
});

export default buttonStyles;