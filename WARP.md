# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the frontend component of the **Kube Credential System**, an enterprise-grade credential management solution built with React, TypeScript, and Vite. The application provides two main functions:

1. **Credential Issuance** - Issue new credentials to the system
2. **Credential Verification** - Verify the authenticity of existing credentials

The frontend communicates with separate backend services deployed on Vercel for credential issuance and verification operations.

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Deployment**: Vercel with Docker support

### Application Structure
- **App.tsx**: Main application component with routing and navigation layout
- **pages/IssuePage.tsx**: Credential issuance interface
- **pages/VerifyPage.tsx**: Credential verification interface
- **services/mockApi.ts**: Mock API for development/testing

### API Integration
The application integrates with two backend services:
- **Issuance API**: `https://insurance-kube.vercel.app` (configurable via `VITE_ISSUANCE_API`)
- **Verification API**: `https://verification-kube.vercel.app` (configurable via `VITE_VERIFICATION_API`)

Both services can be replaced with mock APIs by setting `USE_MOCK_API = true` in the respective page components.

## Development Commands

### Local Development
```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Create a `.env` file for custom API endpoints:
```bash
VITE_ISSUANCE_API=http://localhost:3001
VITE_VERIFICATION_API=http://localhost:3002
VITE_USE_MOCK_API=true  # Force mock API usage
```

### Docker Development
```bash
# Build Docker image
docker build -t kube-credential-frontend .

# Run container
docker run -p 80:80 kube-credential-frontend
```

## Code Patterns and Conventions

### State Management
- Uses React's built-in `useState` and `useEffect` hooks
- Error handling with user-friendly messages
- Loading states for async operations

### API Communication
- Centralized error handling with specific network error detection
- 10-second timeout for all API calls
- Proper CORS headers for cross-origin requests

### Styling Patterns
- Tailwind CSS utility classes throughout
- Color scheme: Purple for branding, Blue for issuance, Green for verification
- Responsive design with mobile-first approach
- Consistent spacing and typography

### Component Structure
- Pages are functional components using hooks
- Props typing with TypeScript interfaces
- Form handling with controlled components

## Key Features

### Credential Issuance Flow
1. User inputs credential data in JSON format
2. Frontend validates JSON syntax
3. API call to issuance service with error handling
4. Display success response or error message

### Credential Verification Flow
1. User inputs credential ID in JSON format
2. Frontend validates input and makes API call
3. Display verification status with visual indicators
4. Show worker pod information and timestamp

### Error Handling
- JSON validation errors
- Network connectivity issues
- Backend service unavailability
- HTTP error status codes with user-friendly messages

## Deployment Configuration

### Vercel Configuration
The `vercel.json` file configures:
- API proxying to backend services
- SPA routing with catch-all redirects
- Cache headers for optimal performance

### Nginx Configuration
For Docker deployment, nginx serves static files with:
- SPA routing support
- Static asset caching (30 days)
- Proper MIME type handling

## Testing and Development

### Mock API Usage
The application includes automatic fallback to mock APIs when backend services are unavailable:

**Manual Override:**
- Set `VITE_USE_MOCK_API=true` in environment variables
- Or set `USE_MOCK_API = true` in the component files

**Automatic Fallback:**
- When backend services return 500 errors, the app automatically falls back to mock APIs
- Fallback responses include a `_fallback: true` flag and explanatory message
- Mock responses simulate realistic network delays and various scenarios

### Common Development Tasks
- **Add new pages**: Create in `src/pages/` and add routes to `App.tsx`
- **Modify API endpoints**: Update environment variables or hardcoded URLs in component files
- **Styling changes**: Use Tailwind classes or modify `tailwind.config.js`
- **Build issues**: Check Node.js version compatibility and npm cache

## Troubleshooting

### Backend Service Issues
If you encounter 500 errors from backend services:
1. **Automatic Fallback**: The app will automatically use mock APIs
2. **Check Service Status**: Visit the backend URLs directly:
   - Issuance: https://insurance-kube.vercel.app/
   - Verification: https://verification-kube.vercel.app/
3. **Enable Mock Mode**: Set `VITE_USE_MOCK_API=true` in `.env`

### Common Error Messages
- **"Backend service unavailable"**: Check if backend services are running
- **"Invalid JSON format"**: Verify the credential data is valid JSON
- **"Network Error"**: Check internet connection or API endpoints

### Development Mode
- The app runs on port 3000 by default, but will automatically find an available port
- Hot reload is enabled for all source file changes
- Error overlay shows compilation errors in development
