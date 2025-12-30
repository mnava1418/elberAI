import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const sideMenuStyles = StyleSheet.create({
    container: {
        backgroundColor: appColors.primary
    },

    header: {
        backgroundColor: appColors.secondary, 
        marginRight: 8, 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: 100
    },

    logo: {
        height: 28, 
        width: 28, 
        margin: 8
    },

    itemLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: appColors.subtitle
    },

    item: {
        backgroundColor: 'transparent',
        borderRadius: 25
    },

    separator: { 
        height: 2, 
        backgroundColor: appColors.subtitle, 
        marginVertical: 16, 
        marginHorizontal: 16,
        opacity: 0.3 
    }
})

export default sideMenuStyles