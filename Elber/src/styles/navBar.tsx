import { StyleSheet } from "react-native";

const navBarStyles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        paddingHorizontal: 8, 
        justifyContent: 'center', 
        alignItems: 'center',         
        zIndex: 2,
    },

    title: {
        flex: 1,
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',         
    }
})

export default navBarStyles