
# Notification Services

Complete microservice for email notifications with JWT authentication, rate limiting, and Gmail OAuth2 integration.

## 🚀 Features

- **Secure Email Delivery**: OAuth2 authentication with Gmail SMTP
- **JWT Authentication**: Protected API endpoints with token validation  
- **Rate Limiting**: Built-in request throttling (100 requests per 15 minutes)
- **Template System**: Dynamic HTML email templates with multiple message types
- **Multi-recipient Support**: BCC functionality for bulk notifications
- **Security Headers**: Helmet.js integration for enhanced security
- **Docker Ready**: Multi-stage build for optimized production deployment
- **TypeScript**: Full type safety and modern development experience

## 📧 Email Types Supported

1. **Access Requests**: User registration requests with admin notifications
2. **Access Responses**: Approval/rejection notifications with access codes
3. **Account Verification**: Email verification links for new accounts  
4. **Password Recovery**: Secure password reset functionality

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Email Service**: Nodemailer with Gmail OAuth2
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet.js, Express Rate Limit
- **Build Tool**: TypeScript Compiler
- **Deployment**: Docker with multi-stage build

## 📁 Project Structure

```
src/
├── app.ts              # Express app configuration
├── bin/www.ts          # Server entry point
├── config/             # Environment and service configuration
├── controllers/        # Request handlers for email operations
├── middlewares/        # JWT authentication and security
├── routes/             # API endpoint definitions
├── services/           # Email service logic and Gmail integration
├── templates/          # HTML email templates
└── types/              # TypeScript type definitions
```

## 🚦 API Endpoints

### Base URL
```
http://localhost:4043
```

### Health Check
```http
GET /health
```

### Email Operations (All require JWT authentication)

#### Request Access
```http
POST /email/requestAccess
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
    "userEmail": "user@example.com",
    "approveURL": "https://app.com/approve/123",
    "rejectURL": "https://app.com/reject/123" 
}
```

#### Access Response  
```http
POST /email/accessResponse
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
    "email": "user@example.com",
    "isApproved": true,
    "accessCode": 123456
}
```

#### Verify Account
```http
POST /email/verifyAccount
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
    "email": "user@example.com",
    "name": "John Doe",
    "link": "https://app.com/verify/abc123"
}
```

#### Reset Password
```http
POST /email/resetPassword
Content-Type: application/json  
Authorization: Bearer <jwt_token>

{
    "email": "user@example.com",
    "recoverLink": "https://app.com/reset/xyz789"
}
```

## ⚙️ Environment Configuration

Create a `.env` file with the following variables:

```env
# Gmail OAuth2 Credentials (Service Account JSON file path)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Server Configuration
NOTIFICATION_PORT=4043

# JWT Secret for internal service authentication  
INTERNAL_TOKEN=your_jwt_secret_here
```

## 🔑 Gmail OAuth2 Setup

1. Create a Google Cloud Project
2. Enable Gmail API  
3. Create a Service Account
4. Download the JSON credentials file
5. Set the file path in `GOOGLE_APPLICATION_CREDENTIALS`

## 🐳 Docker Deployment

### Build Image
```bash
# From the parent directory containing notification-services/
docker build -f notification-services/Dockerfile -t elber-notifications .
```

### Run Container
```bash
docker run -p 4043:4043 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/creds/gmail-creds.json \
  -e NOTIFICATION_PORT=4043 \  
  -e INTERNAL_TOKEN=your_jwt_secret \
  -v /path/to/creds:/app/creds \
  elber-notifications
```

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- npm or yarn
- Gmail OAuth2 service account

### Installation
```bash
# Install dependencies
npm install

# Create environment file
cp .env.template .env
# Edit .env with your configuration

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server  
npm start
```

### Development URL
```
http://localhost:4043
```

## 🔒 Security Features

- **JWT Authentication**: All endpoints protected except health check
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js provides comprehensive security headers
- **Input Validation**: Express built-in JSON parsing with limits
- **OAuth2**: Secure email sending without storing passwords
- **Environment Variables**: Sensitive data externalized from code

## 🏗 Architecture Highlights

- **Microservice Design**: Focused single responsibility (notifications)
- **Clean Architecture**: Separation of concerns with controllers, services, and routes  
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Graceful error management and logging
- **Template Engine**: Reusable HTML email templates with dynamic content
- **Multi-stage Docker**: Optimized production builds
- **Configuration Management**: Environment-based config with validation

## 🧪 Testing

```bash
# Test endpoints with curl
curl -X GET http://localhost:4043/health

# Test with authentication
curl -X POST http://localhost:4043/email/verifyAccount \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \  
  -d '{"email":"test@example.com","name":"Test User","link":"https://verify.com"}'
```

## 📊 Performance & Monitoring

- **Rate Limiting**: Prevents API abuse
- **Request Logging**: All requests logged for monitoring
- **Health Endpoint**: Service status checking
- **Graceful Shutdowns**: Proper connection cleanup
- **Memory Efficient**: Alpine Linux base image

## 🔧 Customization

### Adding New Email Types
1. Add new enum value in `types/email.type.ts`
2. Create template function in `templates/email.template.ts`  
3. Update switch statement in `services/email.service.ts`
4. Add controller method and route

### Extending Authentication
The JWT middleware can be extended to support:
- Role-based access control
- API key authentication
- Rate limiting per user

---

## 👨‍💻 Developer

**Martín Nava**
- Email: martin@namart.tech
- This microservice demonstrates expertise in Node.js, TypeScript, email automation, security, and containerization.

---

*Part of the ELBER AI Platform - A comprehensive AI assistant ecosystem*
