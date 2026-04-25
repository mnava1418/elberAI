import { Platform } from "react-native"
import Geolocation from "@react-native-community/geolocation"
import IosPermissions from "../adapters/devicePermissions/iosPermissions.adapter"
import AndroidPermissions from "../adapters/devicePermissions/androidPermissions.adapter"

type Location = { lat: number, lon: number }

async function getCurrentLocation(): Promise<Location | null> {
    const permissions = Platform.OS === 'ios' ? new IosPermissions() : new AndroidPermissions()

    const granted = await permissions.checkLocationPermission().catch(() => false)

    if (!granted) {
        return null
    }

    return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                })
            },
            () => resolve(null),
            { enableHighAccuracy: false, timeout: 5000 }
        )
    })
}

export default getCurrentLocation
