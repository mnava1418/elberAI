import { StyleSheet } from "react-native";

const authStyles = StyleSheet.create({    
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 40,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginBottom: 100,
    },
    bottomContent: {
        width: '100%',
        alignItems: 'center',
    },
    logo: {
        width: 180,
        height: 180,
        marginBottom: 20,
    },    
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    }    
});

export default authStyles;