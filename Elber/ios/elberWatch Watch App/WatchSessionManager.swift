import WatchConnectivity

class WatchSessionManager: NSObject, WCSessionDelegate {
    static let shared = WatchSessionManager()
    private override init() { super.init() }

    func activate() {
        guard WCSession.isSupported() else {
            print("[WatchSession][Watch] WCSession not supported on this device")
            return
        }
        WCSession.default.delegate = self
        WCSession.default.activate()
        print("[WatchSession][Watch] Activating session...")
    }

    func sendText(_ text: String) {
        guard WCSession.default.isReachable else {
            print("[WatchSession][Watch] iPhone not reachable, cannot send: \(text)")
            return
        }
        print("[WatchSession][Watch] Sending text to iPhone: \(text)")
        WCSession.default.sendMessage(["text": text], replyHandler: nil) { error in
            print("[WatchSession][Watch] Send error: \(error.localizedDescription)")
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        print("[WatchSession][Watch] Received message from iPhone: \(message)")
        if let response = message["response"] as? String {
            NotificationCenter.default.post(
                name: .watchDidReceiveResponse,
                object: nil,
                userInfo: ["response": response]
            )
        }
    }

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("[WatchSession][Watch] Activation failed: \(error.localizedDescription)")
        } else {
            print("[WatchSession][Watch] Session activated — state: \(activationState.rawValue)")
        }
    }
}

extension Notification.Name {
    static let watchDidReceiveResponse = Notification.Name("watchDidReceiveResponse")
}
