# Smart Autocomplete Search System

A full-stack autocomplete system with server-side Trie implementation, voice input, image OCR, and real-time updates.

## Features

- **Server-side Trie**: Fast prefix matching with O(P) query time
- **Voice Input/Output**: Speech-to-text input and text-to-speech suggestions
- **Image OCR**: Extract text from images using Tesseract.js
- **Fuzzy Matching**: Levenshtein distance fallback for typos
- **Real-time Updates**: WebSocket synchronization across clients
- **Analytics Dashboard**: Search statistics and trending words
- **Synonym Expansion**: Enhanced suggestions with synonyms
- **Export Functionality**: Download Trie state as JSON

## Tech Stack

### Backend
- Node.js + TypeScript + Express
- PostgreSQL (Neon DB)
- Socket.IO for real-time updates
- Custom Trie implementation

### Frontend
- React + TypeScript + Vite
- Tailwind CSS for styling
- Web Speech API (STT/TTS)
- Tesseract.js for OCR
- Socket.IO client

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon DB configured)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DevHoji/Smart-Autocomplete-Search-System.git
cd Smart-Autocomplete-Search-System
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
cd ../backend
cp .env.example .env
# Edit .env with your database credentials
```

5. Run database migrations and seed data:
```bash
npm run migrate
npm run seed
```

6. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

## Project Structure

```
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   │   ├── models/         # Trie and data models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities and helpers
│   │   └── types/          # TypeScript type definitions
│   ├── scripts/            # Database scripts
│   └── tests/              # Backend tests
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Frontend utilities
│   └── tests/              # Frontend tests
├── data/                   # Sample datasets
└── docs/                   # Documentation
```

## API Endpoints

- `GET /api/suggest?prefix=...&k=...` - Get autocomplete suggestions
- `POST /api/select` - Record suggestion selection
- `POST /api/insert` - Add new word to Trie
- `GET /api/export-trie` - Export Trie as JSON
- `GET /api/admin/stats` - Analytics data

## Testing

Run backend tests:
```bash
cd backend
npm test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Documentation

- [Trie Implementation Details](docs/TRIE_EXPLANATION.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)

## License

MIT License
