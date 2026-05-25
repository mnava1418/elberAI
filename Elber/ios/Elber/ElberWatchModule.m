#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

RCT_EXTERN_MODULE(ElberWatchModule, RCTEventEmitter)
RCT_EXTERN_METHOD(sendToWatch:(NSDictionary *)message)
