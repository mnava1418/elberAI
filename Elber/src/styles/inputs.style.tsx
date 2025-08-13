import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const inputStyles = StyleSheet.create({    
    text: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: appColors.secondary,
        borderRadius: 20,
        color: '#fff',
        fontSize: 20,
        width: '100%',
        fontWeight: '500',
        textAlign: 'center',        
    },    
});

export default inputStyles;