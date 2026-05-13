import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const inputStyles = StyleSheet.create({    
    text: {        
        color: appColors.text,
        fontSize: 20,        
        fontWeight: '500',
        textAlign: 'center',        
    },
    inputView: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: appColors.panel,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: appColors.border,
        width: '100%',
    }
});

export default inputStyles;