import { check, Permission, request, RESULTS } from "react-native-permissions";
import ElberPermissions from "./permissions.adapter";

class DevicePermissions implements ElberPermissions{
    async requestPermission(permission: Permission): Promise<boolean> {
        try {
            const result = await check(permission)

            if(result === RESULTS.GRANTED) {
                return true
            } else {
                const requestResult = await request(permission)

                if(requestResult === RESULTS.GRANTED) {
                    return true
                } else {
                    return false
                }
            }    
        } catch (error) {
            console.error(error)
            throw new Error('Unable to request permission');
        }
    }
    
    checkMicrophonePermission(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    checkSpeechRecognitionPermission(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}

export default DevicePermissions