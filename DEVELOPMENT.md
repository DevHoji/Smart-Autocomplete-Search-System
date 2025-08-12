# Development Guide

This document provides detailed information for developers working on the Smart Autocomplete Search System.

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • Autocomplete  │    │ • Trie Service  │    │ • Words Table   │
│ • Voice Input   │    │ • API Routes    │    │ • Search Logs   │
│ • Image OCR     │    │ • Analytics     │    │ • Indexes       │
│ • Analytics     │    │ • WebSocket     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Input** → Frontend captures text/voice/image input
2. **API Request** → Frontend sends search request to backend
3. **Trie Search** → Backend searches in-memory Trie structure
4. **Database Query** → Backend queries PostgreSQL for additional data
5. **Response** → Backend returns ranked suggestions
6. **UI Update** → Frontend displays suggestions with metadata
7. **Selection Tracking** → User selection updates frequency in database

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ with npm
- PostgreSQL 14+
- Git
- VS Code (recommended)

### Environment Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/DevHoji/Smart-Autocomplete-Search-System.git
   cd Smart-Autocomplete-Search-System
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

2. **Database Configuration**
   ```bash
   # Create database
   createdb smart_autocomplete
   
   # Set environment variables
   export DATABASE_URL="postgresql://user:pass@localhost:5432/smart_autocomplete"
   export NODE_ENV="development"
   export PORT="3001"
   ```

3. **Initialize Database**
   ```bash
   cd backend
   npm run migrate
   npm run seed
   ```

### Development Workflow

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Run Tests** (Terminal 3)
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── index.ts                 # Express app setup
│   ├── models/
│   │   ├── Trie.ts             # Core Trie implementation
│   │   └── types.ts            # TypeScript interfaces
│   ├── routes/
│   │   ├── suggest.ts          # Autocomplete endpoint
│   │   ├── select.ts           # Selection tracking
│   │   └── analytics.ts        # Analytics endpoints
│   ├── services/
│   │   ├── trieService.ts      # Trie business logic
│   │   ├── dbService.ts        # Database operations
│   │   └── analyticsService.ts # Analytics processing
│   └── utils/
│       ├── logger.ts           # Logging utilities
│       └── validation.ts       # Input validation
├── tests/                      # Test files
├── scripts/                    # Database scripts
└── data/                       # Sample data
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Autocomplete.tsx    # Main search component
│   │   ├── SuggestionItem.tsx  # Individual suggestion
│   │   ├── VoiceInput.tsx      # Voice controls
│   │   ├── ImageUpload.tsx     # OCR functionality
│   │   ├── AnalyticsDashboard.tsx # Analytics view
│   │   └── charts/             # Chart components
│   ├── hooks/
│   │   ├── useAutocomplete.ts  # Search logic
│   │   ├── useVoiceInput.ts    # Voice input handling
│   │   ├── useImageOCR.ts      # OCR processing
│   │   └── useAnalytics.ts     # Analytics data
│   ├── services/
│   │   └── api.ts              # Backend communication
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   └── styles/
│       └── index.css           # Tailwind CSS
└── tests/                      # Test files
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Trie operations, utility functions
- **Integration Tests**: API endpoints, database operations
- **Performance Tests**: Response time, memory usage

### Frontend Testing
- **Component Tests**: React component behavior
- **Hook Tests**: Custom hook functionality
- **E2E Tests**: User workflows (planned)

### Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- Trie.test.ts

# Watch mode
npm test -- --watch
```

## 🔍 Code Quality

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Strict null checks
- Path mapping for imports

### ESLint Rules
- Airbnb configuration
- React hooks rules
- TypeScript specific rules
- Custom rules for project

### Prettier Configuration
- 2-space indentation
- Single quotes
- Trailing commas
- Line width: 100

## 📊 Performance Considerations

### Backend Optimization
- **Trie Structure**: O(k) search complexity where k = prefix length
- **Database Indexing**: B-tree indexes on frequently queried columns
- **Connection Pooling**: Reuse database connections
- **Caching**: In-memory caching for frequent queries (planned)

### Frontend Optimization
- **Debouncing**: 300ms delay for API calls
- **Virtual Scrolling**: For large suggestion lists (planned)
- **Code Splitting**: Lazy load components
- **Bundle Optimization**: Tree shaking, minification

### Monitoring
- Response time tracking
- Memory usage monitoring
- Error rate tracking
- User interaction analytics

## 🔒 Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate API parameters
- SQL injection prevention
- XSS protection

### Authentication (Planned)
- JWT token authentication
- Rate limiting per user
- API key management
- CORS configuration

### Data Privacy
- No sensitive data logging
- Anonymized analytics
- GDPR compliance ready
- Secure data transmission

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Run in production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```bash
# Production Backend
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info

# Production Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME="Smart Autocomplete"
VITE_ENVIRONMENT=production
```

## 🐛 Debugging

### Backend Debugging
```bash
# Enable debug logging
DEBUG=app:* npm run dev

# Use Node.js inspector
node --inspect src/index.ts
```

### Frontend Debugging
- React Developer Tools
- Redux DevTools (if using Redux)
- Browser Network tab for API calls
- Console logging with debug levels

### Common Issues
1. **Database Connection**: Check DATABASE_URL format
2. **CORS Errors**: Verify CORS_ORIGIN setting
3. **Build Failures**: Clear node_modules and reinstall
4. **Test Failures**: Check test database setup

## 📈 Performance Monitoring

### Metrics to Track
- API response times
- Database query performance
- Frontend bundle size
- User interaction patterns
- Error rates and types

### Tools
- Backend: Custom logging, APM tools
- Frontend: Web Vitals, Analytics
- Database: Query analysis, slow query log

## 🤝 Contributing Guidelines

### Code Style
- Follow TypeScript strict mode
- Use meaningful variable names
- Write comprehensive tests
- Document complex logic

### Git Workflow
1. Create feature branch from `development`
2. Make changes with descriptive commits
3. Write/update tests
4. Submit pull request
5. Code review and merge

### Pull Request Template
- Description of changes
- Testing performed
- Breaking changes (if any)
- Screenshots (for UI changes)

## 📚 Additional Resources

- [Trie Data Structure Explanation](docs/TRIE_EXPLANATION.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
