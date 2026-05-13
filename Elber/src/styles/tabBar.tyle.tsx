import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const tabBarStyles = StyleSheet.create({    
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: appColors.primary,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    }
});

export default tabBarStyles;