import admin from 'firebase-admin'
import initFirebase from '../../loaders/firebase.loader'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn().mockReturnValue('mock-credential'),
    },
    auth: jest.fn(),
  },
}))

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path/credentials.json', db: 'https://test.firebaseio.com' },
  gateway: { secret: 'test-secret' },
  server: { port: 4040, host: 'http://localhost:4040' },
  paths: {},
}))

describe('firebase.loader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call admin.initializeApp with credential and databaseURL', () => {
    initFirebase()

    expect(admin.credential.cert).toHaveBeenCalledWith('/fake/path/credentials.json')
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: 'mock-credential',
      databaseURL: 'https://test.firebaseio.com',
    })
  })

  it('should not throw when initializeApp fails', () => {
    ;(admin.initializeApp as jest.Mock).mockImplementation(() => {
      throw new Error('Already initialized')
    })

    expect(() => initFirebase()).not.toThrow()
  })
})
