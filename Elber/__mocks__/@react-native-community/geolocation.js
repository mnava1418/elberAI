module.exports = {
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn((success) =>
      success({ coords: { latitude: 0, longitude: 0 } })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
  },
}
