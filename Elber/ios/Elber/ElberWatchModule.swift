import React

@objc(ElberWatchModule)
class ElberWatchModule: RCTEventEmitter {
    override init() {
        super.init()
        WatchSessionManager.shared.emitter = self
        print("[ElberWatchModule] Module initialized, registered as emitter")
    }

    @objc override static func requiresMainQueueSetup() -> Bool { false }

    override func supportedEvents() -> [String]! {
        ["onWatchMessage"]
    }

    @objc func sendToWatch(_ message: NSDictionary) {
        print("[ElberWatchModule] sendToWatch called with: \(message)")
        if let response = message["response"] as? String {
            WatchSessionManager.shared.sendResponse(response)
        } else {
            print("[ElberWatchModule] sendToWatch: missing 'response' key in message")
        }
    }
}
