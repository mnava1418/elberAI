import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const inputStyles = StyleSheet.create({    
    text: {        
        color: '#fff',
        fontSize: 20,        
        fontWeight: '500',
        textAlign: 'center',        
    },
    inputView: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: appColors.secondary,
        borderRadius: 20,        
        width: '100%',        
    }
});

export default inputStyles;