import { StyleSheet } from "react-native";
import { appColors } from "./main.style";

const settingsStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.primary,
    },

    profileSection: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomColor: '#333',
        marginBottom: 8,
    },
    
    logoContainer: {
        flexDirection: 'column', 
        justifyContent: 'center', 
        backgroundColor: appColors.secondary, 
        borderRadius: 100, 
        marginBottom: 12,
    },

    logo: {
        height: 80, 
        width: 80, 
        margin: 12
    },

    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: appColors.text,
        marginBottom: 4,
    },

    profileEmail: {
        fontSize: 16,
        color: appColors.subtitle,
    },

    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: appColors.text,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    section: {
        backgroundColor: appColors.secondary,
        marginHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },

    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomColor: '#404040',
    },

    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#404040',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    settingItemContent: {
        flex: 1,
    },

    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: appColors.text,
        marginBottom: 2,
    },

    settingSubtitle: {
        fontSize: 14,
        color: appColors.subtitle,
    },

    logoutSection: {
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
});

export default settingsStyle;