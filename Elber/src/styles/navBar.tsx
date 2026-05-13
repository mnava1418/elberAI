import { StyleSheet } from "react-native";

const navBarStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },

    title: {
        flex: 1,
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',         
    }
})

export default navBarStyles