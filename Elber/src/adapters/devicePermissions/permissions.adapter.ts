import { Permission } from "react-native-permissions";

abstract class ElberPermissions {
    abstract requestPermission(permission: Permission): Promise<boolean>
    abstract checkMicrophonePermission(): Promise<boolean>
    abstract checkSpeechRecognitionPermission(): Promise<boolean>
    abstract checkLocationPermission(): Promise<boolean>
}

export default ElberPermissions