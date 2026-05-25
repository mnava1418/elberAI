//
//  elberWatchApp.swift
//  elberWatch Watch App
//
//  Created by Martin Nava on 25/05/26.
//

import SwiftUI

@main
struct elberWatch_Watch_AppApp: App {
    init() {
        WatchSessionManager.shared.activate()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
