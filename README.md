# 99Group Game Platform - Next.js Version

A modern game platform built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. This is a complete conversion from the original vanilla HTML/CSS/JavaScript implementation.

## 🚀 Features

- **Modern React Architecture**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **User Authentication**: Login and registration with captcha verification
- **Game Integration**: Play various slot and fish games in an embedded iframe
- **Wallet Management**: Real-time balance tracking and withdrawal system
- **KYC Verification**: Document upload and verification system
- **Transaction History**: Complete audit trail of all user activities
- **Real-time Updates**: Balance updates and game state synchronization

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management
- **Next/Image** - Optimized image loading

### Backend

- **Express.js** - Node.js web framework
- **SQLite** - Database for user data and transactions
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- **Node.js 20** or higher
- **npm** or **yarn**
- **SQLite3**

## 🚀 Quick Start

### 1. Installation

```bash
cd /home/ubuntu/game-platform01/nextjs-game-platform
npm install
```

### 2. Start Development Server

Use the convenient startup script:

```bash
./start.sh
```

Or start services manually:

```bash
# Start backend server (port 3068)
npm run dev:server

# In another terminal, start frontend (port 3000)
npm run dev:next
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3068

## 📁 Project Structure

```
nextjs-game-platform/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main page component
│   ├── components/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── GameFrame.tsx        # Game iframe wrapper
│   │   ├── LoginForm.tsx        # Authentication form
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── ProgressSection.tsx  # Progress visualization
│   │   ├── RegisterForm.tsx     # Registration form
│   │   ├── TabNavigation.tsx    # Tab switcher
│   │   └── tabs/
│   │       ├── GamesTab.tsx     # Games listing
│   │       ├── HistoryTab.tsx   # Transaction history
│   │       ├── KYCTab.tsx       # KYC verification
│   │       └── WalletTab.tsx    # Wallet management
│   └── types/
│       └── index.ts             # TypeScript definitions
├── public/                      # Static assets
├── server_enhanced.js           # Backend Express server
├── game_platform.db            # SQLite database
├── start.sh                     # Startup script
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── package.json                # Dependencies
```

## 🎮 Key Features Explained

### Authentication System

- **Login/Register**: Secure user authentication with JWT tokens
- **Captcha Verification**: Visual captcha for registration security
- **Session Management**: Automatic token refresh and validation

### Game Integration

- **Iframe Security**: Sandboxed game environment with proper permissions
- **Real-time Balance**: Balance updates after each game session
- **Error Handling**: Graceful handling of game loading failures

### Wallet System

- **Progress Tracking**: Visual progress bar showing path to withdrawal
- **Milestone System**: Clear indicators of user progress
- **Withdrawal Management**: Complete withdrawal request and approval system

### KYC Verification

- **Document Upload**: Secure file upload for identity verification
- **Status Tracking**: Real-time status updates for verification process
- **File Validation**: Client-side validation for file types and sizes

## 🔧 Configuration

### Environment Variables

The application uses the existing backend configuration. Key settings:

- **API Base URL**: Configured via Next.js rewrites in `next.config.js`
- **Database**: SQLite database file (`game_platform.db`)
- **File Uploads**: Stored in `uploads/` directory

### API Routes

All API calls are proxied to the Express backend:

- `/api/*` → `http://localhost:3068/api/*`

## 🚀 Production Deployment

### Build the Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

This will start both the Next.js production server and the Express backend.

## 📱 Mobile Responsiveness

The application is fully responsive with:

- **Mobile Navigation**: Collapsible navigation for small screens
- **Touch-Friendly**: Large buttons and touch targets
- **Responsive Grid**: Adaptive game grid layout
- **Mobile Tabs**: Icon-based navigation on mobile devices

## 🎨 UI/UX Improvements

### Modern Design

- **Gradient Backgrounds**: Beautiful gradient overlays
- **Glass Morphism**: Backdrop blur effects for modern look
- **Smooth Animations**: CSS transitions and hover effects
- **Loading States**: Visual feedback during API calls

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color schemes

## 🔒 Security Features

- **Input Validation**: Client and server-side validation
- **XSS Protection**: Proper escaping of user content
- **CSRF Protection**: Token-based request validation
- **File Upload Security**: Type and size validation
- **Iframe Sandboxing**: Restricted permissions for game content

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000 and 3068 are available
2. **Database Permissions**: Check SQLite file permissions
3. **Node Version**: Ensure Node.js 20+ is installed
4. **Dependencies**: Run `npm install` if modules are missing

### Development Tips

- **Hot Reload**: Frontend changes auto-reload
- **API Debugging**: Backend logs show in terminal
- **Type Safety**: TypeScript catches errors at compile time
- **Linting**: ESLint configured for code quality

## 📝 Migration Notes

### Key Changes from Original

1. **Component Architecture**: Modular React components
2. **Type Safety**: Full TypeScript implementation
3. **Modern CSS**: Tailwind utility classes
4. **State Management**: React hooks instead of global variables
5. **Error Handling**: Proper error boundaries and validation

### Preserved Features

- **All Original Functionality**: Complete feature parity
- **Database Schema**: No changes to existing data
- **API Compatibility**: Same backend endpoints
- **Game Integration**: Identical iframe implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
