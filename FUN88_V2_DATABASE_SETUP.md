# FUN88-V2 Standalone Database Setup

This document outlines the standalone database configuration for the fun88-v2 project, ensuring complete isolation from other projects.

## 🗄️ Database Configuration

### Database Details
- **Database File**: `fun88_standalone.db`
- **Type**: SQLite
- **Location**: `/home/ubuntu/fun88-v2/fun88_standalone.db`
- **Status**: ✅ Standalone and Isolated

### Database Features
- **WAL Mode**: Enabled for better concurrency
- **Memory Cache**: 10,000 pages
- **Synchronous**: NORMAL mode for performance
- **Temp Store**: Memory-based for speed

## 📋 Database Schema

The standalone database includes all required tables:

### Core Tables
- `users` - User accounts with game integration
- `admins` - Admin user management
- `game_sessions` - Active game sessions
- `game_transactions` - Transaction history
- `withdrawals` - Withdrawal requests and processing

### Content Management
- `blogs` - Blog posts and content
- `categories` - Content categories
- `tags` - Content tags
- `media_files` - Media file management
- `media_folders` - Media folder organization

### System Configuration
- `system_settings` - System-wide settings
- `seo_settings` - SEO configuration
- `global_seo_settings` - Global SEO settings
- `captcha_codes` - Captcha verification

### Game Management
- `games` - Game library
- `game_library_providers` - Game provider configurations

### KYC & Security
- `kyc_documents` - KYC verification documents

## 🔧 Configuration Files Updated

### Main Server
- `server_enhanced.js` - Uses `fun88_standalone.db`
- `deployment/server_enhanced.js` - Uses `fun88_standalone.db`

### API Routes
All API routes in `src/app/api/` are configured to use `fun88_standalone.db`:
- Admin routes
- Game management routes
- User management routes
- Content management routes

### Configuration Files
- `fun88-standalone-config.js` - Updated to reference `fun88_standalone.db`
- `STANDALONE_SETUP.md` - Updated documentation

## 🚀 Database Initialization

The database is automatically created and initialized when the server starts:

```bash
# Start the server
node server_enhanced.js

# Or with PM2
pm2 start ecosystem.config.js
```

### Initial Data
- 1 default admin user (username: `admin`, password: `admin123`)
- System settings initialized
- All required table structures created

## 🔒 Security Features

### JWT Configuration
- **Secret**: `fun88-secret-key-change-in-production`
- **Role-based access**: Admin and Super Admin roles
- **Session management**: Secure token validation

### Data Isolation
- **Complete separation** from other projects
- **Independent operation** - no shared resources
- **Clean state** - fresh database with no legacy data

## 📊 Database Management

### Backup
```bash
# Create backup
cp fun88_standalone.db fun88_standalone_backup_$(date +%Y%m%d_%H%M%S).db
```

### Restore
```bash
# Restore from backup
cp fun88_standalone_backup_YYYYMMDD_HHMMSS.db fun88_standalone.db
```

### Database File Location
```bash
# Check database file
ls -la fun88_standalone.db*

# Expected files:
# fun88_standalone.db      - Main database file
# fun88_standalone.db-shm  - Shared memory file (WAL mode)
# fun88_standalone.db-wal  - Write-ahead log file (WAL mode)
```

## ✅ Verification Checklist

To verify the database is properly isolated:

1. **Check database file exists**: `ls -la fun88_standalone.db`
2. **Verify server connects**: Look for "✅ Connected to SQLite database successfully"
3. **Test admin login**: Use admin/admin123 credentials
4. **Check data isolation**: No data from other projects should be present
5. **Verify WAL mode**: Check for .db-shm and .db-wal files

## 🔄 Port Configuration

### Development Mode
- Frontend: Port **3007**
- Backend: Port **5002**

### Production Mode (PM2)
- Frontend: Port **3008**
- Backend: Port **5001**

## 📝 Notes

- The database file is created automatically on first run
- WAL mode provides better concurrency for multiple connections
- All API routes use the same database connection
- Database is completely isolated from other fun88 projects
- No external database dependencies required

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if database file exists
ls -la fun88_standalone.db

# Check file permissions
chmod 644 fun88_standalone.db

# Restart server
pm2 restart fun88-backend
```

### Database Corruption
```bash
# Check database integrity
sqlite3 fun88_standalone.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
cp fun88_standalone_backup_*.db fun88_standalone.db
```

---

**Status**: ✅ Standalone database setup complete  
**Last Updated**: $(date)  
**Project**: fun88-v2
