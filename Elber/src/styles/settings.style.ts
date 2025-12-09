import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const settingsStyle = StyleSheet.create({    
    logoContainer: {
        flexDirection: 'column', 
        justifyContent: 'center', 
        backgroundColor: appColors.secondary, 
        borderRadius: 100, 
        marginTop: 20, 
        marginBottom: 12,
    },

    logo: {
        height: 120, 
        width: 120, 
        margin: 16
    }
});

export default settingsStyle;