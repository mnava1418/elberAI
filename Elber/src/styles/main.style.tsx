import { StyleSheet } from "react-native"

export const appColors = {
    primary: '#06070d',
    secondary: '#0d0f1a',
    contrast: '#7df9ff',
    text: '#f5f7ff',
    subtitle: '#8a91a6',
    dim: '#8a91a6',
    dimmer: '#5f6478',
    cyan: '#7df9ff',
    violet: '#b18cff',
    error: '#ff7a8e',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    panel: 'rgba(255,255,255,0.04)',
    panelStrong: 'rgba(255,255,255,0.07)',
    glow: 'rgba(125,249,255,0.35)',
    glowSoft: 'rgba(125,249,255,0.12)',
}

export const mainStyles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }
})