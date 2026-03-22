// Suppress TurboModuleRegistry errors for any unregistered native module
const originalGetEnforcing = require('react-native/Libraries/TurboModule/TurboModuleRegistry').getEnforcing
require('react-native/Libraries/TurboModule/TurboModuleRegistry').getEnforcing = (name) => {
  try {
    return originalGetEnforcing(name)
  } catch {
    return {}
  }
}

// Mock react-native-share (used internally by gifted-chat)
jest.mock('react-native-share', () => ({
  __esModule: true,
  default: { open: jest.fn(), getConstants: jest.fn().mockReturnValue({}) },
}))

// Mock @react-native-clipboard
jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    getString: jest.fn().mockResolvedValue(''),
    setString: jest.fn(),
    hasString: jest.fn().mockResolvedValue(false),
  },
}))

// Mock react-native-gesture-handler to avoid native module errors
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  Gesture: { Pan: jest.fn(), Tap: jest.fn(), Simultaneous: jest.fn() },
  GestureDetector: ({ children }: any) => children,
  PanGestureHandler: ({ children }: any) => children,
  TapGestureHandler: ({ children }: any) => children,
  State: {},
}))

// Mock react-native-worklets before reanimated loads it
jest.mock('react-native-worklets', () => ({
  useWorklet: jest.fn(),
  runOnUI: jest.fn((fn) => fn),
  runOnJS: jest.fn((fn) => fn),
}))

// Mock react-native-reanimated manually to avoid native initialization
jest.mock('react-native-reanimated', () => {
  const Animated = require('react-native').Animated
  return {
    __esModule: true,
    default: Animated,
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn((fn) => fn()),
    useAnimatedKeyboard: jest.fn(() => ({ height: { value: 0 } })),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    withDelay: jest.fn((_, val) => val),
    withRepeat: jest.fn((val) => val),
    withSequence: jest.fn((...args) => args[args.length - 1]),
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
    Easing: { linear: jest.fn(), bezier: jest.fn() },
    interpolate: jest.fn(),
    Extrapolation: { CLAMP: 'clamp' },
    FadeIn: { duration: jest.fn(() => ({ delay: jest.fn(() => ({})) })) },
    FadeOut: { duration: jest.fn(() => ({})) },
    SlideInRight: { duration: jest.fn(() => ({})) },
    SlideOutLeft: { duration: jest.fn(() => ({})) },
    createAnimatedComponent: jest.fn((c) => c),
    addWhitelistedUIProps: jest.fn(),
  }
})

// Mock @react-native-firebase/app globally so native modules don't crash in Jest
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: {
    apps: [],
    initializeApp: jest.fn(),
  },
}))

// @react-native-firebase/auth is mocked via __mocks__/@react-native-firebase/auth.js

jest.mock('socket.io-client', () => ({
  io: jest.fn().mockReturnValue({
    connected: false,
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    removeAllListeners: jest.fn(),
  }),
}))

jest.mock('@react-native-voice/voice', () => ({
  __esModule: true,
  default: {
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
    removeAllListeners: jest.fn(),
    onSpeechStart: null,
    onSpeechEnd: null,
    onSpeechResults: null,
    onSpeechError: null,
  },
}))

jest.mock('react-native-permissions', () => ({
  check: jest.fn().mockResolvedValue('granted'),
  request: jest.fn().mockResolvedValue('granted'),
  openSettings: jest.fn(),
  PERMISSIONS: { IOS: {}, ANDROID: {} },
  RESULTS: { GRANTED: 'granted', DENIED: 'denied', BLOCKED: 'blocked' },
}))
