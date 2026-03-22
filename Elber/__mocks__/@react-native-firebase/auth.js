module.exports = {
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  })),
  getAuth: jest.fn().mockReturnValue({
    currentUser: null,
    onAuthStateChanged: jest.fn(() => jest.fn()),
  }),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null)
    return jest.fn()
  }),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
}
