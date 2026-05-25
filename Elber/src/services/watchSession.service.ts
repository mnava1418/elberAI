import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

const {ElberWatchModule} = NativeModules;
const emitter =
  Platform.OS === 'ios' && ElberWatchModule
    ? new NativeEventEmitter(ElberWatchModule)
    : null;

export function sendResponseToWatch(response: string) {
  if (Platform.OS !== 'ios' || !ElberWatchModule) {
    console.warn(
      '[WatchSession] sendResponseToWatch skipped — not iOS or module missing',
    );
    return;
  }
  console.log('[WatchSession] Sending response to Watch:', response.slice(0, 80));
  ElberWatchModule.sendToWatch({response});
}

export function subscribeToWatchMessages(
  callback: (text: string) => void,
): () => void {
  if (!emitter) {
    console.warn(
      '[WatchSession] subscribeToWatchMessages skipped — emitter not available',
    );
    return () => {};
  }
  console.log('[WatchSession] Subscribed to onWatchMessage events');
  const sub = emitter.addListener('onWatchMessage', (msg: {text: string}) => {
    console.log('[WatchSession] Received from Watch:', msg);
    callback(msg.text);
  });
  return () => sub.remove();
}
