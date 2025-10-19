import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const tabBarStyles = StyleSheet.create({    
    container: {
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        backgroundColor: appColors.primary, 
        paddingTop: 8
    }
});

export default tabBarStyles;