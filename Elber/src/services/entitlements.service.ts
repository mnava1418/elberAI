import AndroidPermissions from "../adapters/devicePermissions/androidPermissions.adapter"
import DevicePermissions from "../adapters/devicePermissions/devicePermissions.adapter"
import IosPermissions from "../adapters/devicePermissions/iosPermissions.adapter"

export const checkVoicePermissions = async (os: 'ios' | 'android') => {
    const devicePermissions = getDevicePermissions(os)

    const microphonePermission:boolean = await devicePermissions.checkMicrophonePermission()
    .catch(() => false)    
    
    const speechRecognitionPermission: boolean = await devicePermissions.checkSpeechRecognitionPermission()
    .catch(() => false)    

    return microphonePermission && speechRecognitionPermission
}

const getDevicePermissions = (os: 'ios' | 'android'): DevicePermissions => {
    let devicePermissions: DevicePermissions;

    if(os === 'ios') {
        devicePermissions = new IosPermissions()
    } else {
        devicePermissions = new AndroidPermissions()
    }

    return devicePermissions
}