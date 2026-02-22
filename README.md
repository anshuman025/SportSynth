# CricSynth - Real-time Cricket Data Platform 🏏

A comprehensive real-time cricket data platform that fetches live scores from official APIs and delivers them through a modern web interface with WebSocket updates.

## 🌟 Features

- **🏏 Live Cricket Data** - Real-time scores from CricAPI
- **🔄 Live UI Updates** - WebSocket connections for instant score and commentary updates
- **📱 Smart Filtering** - UI filtering by match format (T20, ODI, Test)
- **🗄️ PostgreSQL Database** - Efficient data storage with Drizzle ORM
- **⚡ Autonomous Background Polling** - Server automatically fetches new data every minute

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/anshuman025/SportSynth.git
cd SportSynth
```

2. **Install dependencies**
```bash
# Frontend
cd sportz-frontend
npm install

# Backend  
cd ../sportz-websockets
npm install
```

3. **Setup Database**
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb sportz
```

4. **Environment Setup**
```bash
# In sportz-websockets directory
cp .env.example .env
# Edit .env with your database URL and API keys
```

5. **Database Migration**
```bash
cd sportz-websockets
npm run db:migrate
```

6. **Start the Application**
```bash
# Terminal 1 - Backend
cd sportz-websockets
npm run dev

# Terminal 2 - Frontend  
cd sportz-frontend
npm run dev
```

7. **Get Live Sports Data**
```bash
# One-time sync with real data
npm run real-data-sync

# Or continuous updates
npm run real-data-continuous
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws

## 🔧 API Integration

### CricAPI Setup
1. Get free API key at [CricAPI](https://www.cricapi.com/)
2. Add to `.env` file:
```env
CRICAPI_KEY="your-api-key-here"
```

## 📊 Available Scripts

### Backend (sportz-websockets)
```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Drizzle Studio
npm run real-data-sync   # Sync with real sports data
npm run real-data-continuous  # Continuous sync every 5 minutes
```

### Frontend (sportz-frontend)
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🏗️ Project Structure

```
CricSynth/
├── sportz-frontend/          # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── types.ts        # TypeScript definitions
│   └── package.json
│
├── sportz-websockets/       # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Data fetching services
│   │   ├── db/            # Database configuration
│   │   ├── ws/            # WebSocket handlers
│   │   └── scripts/       # Utility scripts
│   └── package.json
│
└── README.md
```

## 🎯 Features in Detail

### Real-time Data Fetching
- **CricAPI Integration**: Live cricket scores from official sources
- **Smart Scheduling**: Matches scheduled based on actual cricket calendars
- **Auto-sync UpSerts**: Safe continuous data polling every 1 minute without destroying websocket connections

### WebSocket Features
- **Live Score Updates**: Instant score changes pushed natively to connected clients via `score_update` hooks
- **Match Commentary**: Real-time commentary updates via `commentary` hooks
- **Connection Management**: Automatic reconnection and heartbeat

### Frontend Features
- **Pill Filters**: Filter matches gracefully by T20, ODI, Test, or Other
- **Intelligent Formatting**: Dates are natively rendered using accurate user-timezones
- **Modern React**: Functional components with hooks and TypeScript
- **Responsive Design**: Mobile-friendly interface

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DATABASE_URL=postgresql://username@localhost:5432/sportz

# Server
PORT=8000
HOST=0.0.0.0

# API Keys
CRICAPI_KEY="your-cricapi-key"

# Arcjet (Security)
ARCJET_KEY=""
ARCJET_ENV="development"
```

## 🎨 Technologies Used

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **WebSocket** - Real-time communication
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Reliable database

### APIs & Services
- **CricAPI** - Live cricket data
- **Arcjet** - Security middleware
- **Site24x7** - Monitoring (optional)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd sportz-frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd sportz-websockets
npm run build
# Deploy with environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [JavaScript Mastery](https://www.youtube.com/@javascriptmastery/videos) - Tutorial inspiration
- [CricAPI](https://www.cricapi.com/) - Cricket data provider
- [Drizzle ORM](https://orm.drizzle.team/) - Excellent TypeScript ORM

## 📞 Support

If you have any questions or issues, please:
- Create an issue on GitHub
- Check the existing documentation
- Review the tutorial videos

---

**Built with ❤️ by [Anshuman Sharma](https://github.com/anshuman025)**
