import admin from 'firebase-admin'
import initFirebase from '../../loaders/firebase.loader'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn().mockReturnValue('mock-credential'),
    },
  },
}))

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path/credentials.json', db: 'https://test.firebaseio.com' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
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
