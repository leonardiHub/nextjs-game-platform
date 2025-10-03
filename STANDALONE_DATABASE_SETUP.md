# Standalone Database Setup

This project now uses a standalone SQLite database to ensure complete isolation from other projects.

## Database Details

- **Database File**: `fun88_standalone.db`
- **Type**: SQLite
- **Location**: `/home/ubuntu/fun88-v1/fun88_standalone.db`

## What Was Changed

1. **Database File Name**: Changed from `fun88_platform.db` to `fun88_standalone.db`
2. **Removed Shared Files**: Deleted old database files that were potentially shared:
   - `fun88_platform.db*`
   - `game_platform.db*`
   - `database.db`

## Database Schema

The standalone database includes all required tables:
- `users` - User accounts
- `admins` - Admin users
- `games` - Game library
- `game_sessions` - Active game sessions
- `game_transactions` - Game transaction history
- `withdrawals` - Withdrawal requests
- `kyc_documents` - KYC verification documents
- `blogs` - Blog posts and content
- `categories` - Content categories
- `tags` - Content tags
- `media_files` - Media file management
- `media_folders` - Media folder organization
- `seo_settings` - SEO configuration
- `global_seo_settings` - Global SEO settings
- `system_settings` - System configuration
- `captcha_codes` - Captcha verification
- `game_library_providers` - Game provider configurations

## Initial Data

The database is initialized with:
- 1 default admin user (username: `admin`, password: `admin123`)
- 12 system settings
- All required table structures

## Benefits

- **Complete Isolation**: No data sharing with other projects
- **Independent Operation**: Can be started/stopped without affecting other systems
- **Clean State**: Fresh database with no legacy data
- **Easy Backup**: Single file backup and restore

## Usage

The server will automatically create and initialize the database on first run. No additional setup is required.

To start the server:
```bash
node server_enhanced.js
```

The database file will be created automatically if it doesn't exist.

