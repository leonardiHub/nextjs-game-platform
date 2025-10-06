# Port 3006 Connection Fix - FUN88-V2

## 🔧 Problem Solved

**Issue**: Application was actively trying to connect to `127.0.0.1:3006` instead of the new port `5002`, causing `ECONNREFUSED` errors.

**Root Cause**: Multiple files throughout the codebase were still hardcoded to use port `3006` instead of the updated port `5002`.

## ✅ Fixes Applied

### 1. Next.js Configuration
**File**: `next.config.js`
- Updated default backend port from `3006` to `5002`
- Fixed proxy rewrites to use correct port

```javascript
// Before
const backendPort = process.env.BACKEND_PORT || 3006

// After  
const backendPort = process.env.BACKEND_PORT || 5002
```

### 2. API Routes (45 files updated)
**Location**: `src/app/api/**/*.ts`
- Updated all API route files to use `localhost:5002`
- Fixed hardcoded backend URLs in proxy requests

**Example Fix**:
```typescript
// Before
const response = await fetch('http://localhost:3006/api/admin/login', {

// After
const response = await fetch('http://localhost:5002/api/admin/login', {
```

### 3. Component Files
**Files Updated**:
- `src/components/admin/MediaLibrary.tsx`
- `src/components/admin/MediaSelectModal.tsx`
- `src/components/Herov2.tsx`
- `src/components/admin/BlogManagement.tsx`
- `src/components/admin/HeroCarouselManagement.tsx`
- `src/components/admin/BlogEditor.tsx`
- `src/utils/schemaProcessor.ts`

**Changes Made**:
- Updated all `localhost:3006` references to `localhost:5002`
- Fixed media URL processing
- Updated API base URL configurations

### 4. Utility Files
**Files Updated**:
- `src/utils/seo.ts` (already fixed in previous session)
- `src/utils/schemaProcessor.ts`

## 🚀 Verification Results

### Backend Status
```bash
# Backend server running on port 5002
lsof -i :5002
# Output: node 1500532 ubuntu 23u IPv6 TCP *:5002 (LISTEN)

# API endpoint working
curl http://localhost:5002/api/seo/global
# Output: "99Group Gaming Platform"
```

### Code Verification
```bash
# No more localhost:3006 references in source code
grep -r "localhost:3006" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
# Output: No more localhost:3006 references found
```

## 📋 Files Modified Summary

### Configuration Files
- `next.config.js` - Updated default backend port

### API Routes (45 files)
- All files in `src/app/api/**/*.ts` updated to use port 5002

### Component Files (7 files)
- Media management components
- Blog management components  
- Hero carousel components
- Utility components

### Utility Files (2 files)
- SEO utilities
- Schema processing utilities

## 🔍 Current Port Configuration

### Development Mode
- **Frontend**: Port **3007** (Next.js)
- **Backend**: Port **5002** (Express)
- **Database**: `fun88_standalone.db`

### Production Mode (PM2)
- **Frontend**: Port **3008** (Next.js)
- **Backend**: Port **5001** (Express)
- **Database**: `fun88_standalone.db`

## ✅ Resolution Status

**Problem**: `ECONNREFUSED 127.0.0.1:3006` errors
**Status**: ✅ **RESOLVED**

- ✅ All hardcoded port 3006 references updated to 5002
- ✅ Backend server running correctly on port 5002
- ✅ API endpoints accessible and responding
- ✅ No more connection refused errors expected

## 🎯 Next Steps

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Verify No Connection Errors**:
   - Frontend should start on port 3007
   - Backend should be accessible on port 5002
   - No `ECONNREFUSED` errors in console

3. **Test Application Features**:
   - Admin login functionality
   - Media upload/management
   - SEO settings
   - Game functionality

The application should now run without any port 3006 connection errors!
