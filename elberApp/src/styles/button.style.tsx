import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const buttonStyles = StyleSheet.create({    
    primary: {
        fontSize: 18,
        borderRadius: 50,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        alignSelf: 'center',
        marginVertical: 12,
        backgroundColor: appColors.contrast,
        margin: 8,
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