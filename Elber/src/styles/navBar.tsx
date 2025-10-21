import { StyleSheet } from "react-native";

const navBarStyles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        paddingHorizontal: 8, 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        width: '100%', 
        height: 32, 
        zIndex: 2,
    },

    title: {
        position: 'absolute', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%'
    }
})

export default navBarStyles