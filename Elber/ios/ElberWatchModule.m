#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ElberWatchModule, RCTEventEmitter)

RCT_EXTERN_METHOD(sendToWatch:(NSDictionary *)message)

@end
