# MATTR Sample Apps

This repository contains a collection of developer apps and API tooling for interfacing with the MATTR Platform. It includes claims source applications, verifier web tutorials, React Native apps, credential templates, and utilities.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites and Environment Setup
- Node.js is required for most projects. Use the system's Node.js installation.
- Docker is available for containerized deployments.
- Some projects require MATTR private SDK registry access (React Native projects).
- Network restrictions may prevent access to external APIs and Google Fonts during builds.

### Project Structure Overview
The repository contains the following main projects:
- **claims-source-app**: Express.js app with ngrok tunneling for OID4VCI Claims Source tutorial
- **verifier-web-tutorial**: Next.js React app using MATTR Verifier Web SDK  
- **manual-revocation-check**: Node.js script for checking credential revocation status
- **react-native-mdocs-holder-tutorial**: React Native Expo apps (starter and complete versions)
- **credential-templates**: Static template files for different credential types
- **postman**: Postman collections for MATTR Platform APIs

## Build and Test Instructions

### manual-revocation-check
- **Install dependencies**: `npm install` (< 1 second)
- **Run script**: `node manual-revocation-check.js [URL_OR_CREDENTIAL] [INDEX]`
  - Example: `node manual-revocation-check.js https://example.com/revocation-list 1`
  - Without arguments: shows "No URL or compact credential provided"
- **Known issue**: Fixed JSON syntax error (trailing comma in package.json scripts section)

### claims-source-app  
- **Install dependencies**: `npm install` (1-2 seconds)
- **Configuration**: Copy `env-example` to `.env` and configure:
  - `CLAIMS_SOURCE_API_KEY=supersecretapikey` 
  - `NGROK_AUTHTOKEN=<your-token>` (required for full functionality)
- **Run full app**: `npm start` (requires ngrok token, will fail without it)
- **Run Express app only**: `node src/index.js` (works without ngrok token)
- **Test endpoint**: `curl -H "x-api-key: supersecretapikey" "http://localhost:3000/claims?email=erika.mustermann@example.com"`
- **Docker build**: `docker build -t claims-source .` (5 seconds)
- **Docker Compose issue**: The docker-compose.yml specifies `platform: linux/arm64` which fails on x64 systems. Remove the platform line or change to appropriate platform.
- **Database**: Uses `database.json` with test users. Email "erika.mustermann@example.com" is available for testing.

### verifier-web-tutorial
- **Install dependencies**: `npm install` (8 seconds)
- **Configuration required**: This app requires MATTR platform credentials to work properly:
  - Create `.env.local` file with: `NEXT_PUBLIC_TENANT_URL=https://your-tenant.mattr.global`
  - Update `src/app/page.tsx` lines 46 and 79 to replace placeholder values:
    - `<your-wallet-provider-id>` → your actual wallet provider ID
    - `<your-application-id>` → your actual application ID
- **Known configuration issue**: Without proper environment variables, the app shows "Error: Invalid initialize options"
- **Development server**: `npm run dev` (1 second startup, uses Turbopack)
  - Runs on http://localhost:3000
  - **NEVER CANCEL**: Dev server starts quickly but may take time for full compilation
- **Production build**: `npm run build` 
  - **KNOWN ISSUE**: Build fails due to Google Fonts network restrictions (getaddrinfo ENOTFOUND fonts.googleapis.com)
  - **WORKAROUND**: Use development mode instead of production build in restricted network environments
- **Linting**: `npm run lint` (< 5 seconds, currently passes with no errors)
- **Start production**: `npm start` (only works after successful build)

### React Native Projects (both starter and complete)
- **Critical limitation**: Both projects require `@mattrglobal/mobile-credential-holder-react-native` SDK which is only available in MATTR's private npm registry
- **Install dependencies**: `npm install` - **WILL FAIL** with "404 Not Found" for MATTR SDK
- **Available scripts**: `npm start`, `npm run android`, `npm run ios`
- **Requirements**: Expo CLI, Android Studio or Xcode for device testing
- **Note**: These projects cannot be built or run without proper SDK registry access

### credential-templates
- **Type**: Static files only - no build process required
- **Contents**: Template files for Compact and Compact Semantic credential profiles
- **Usage**: Reference files for creating credential templates

### postman
- **Type**: Static Postman collection files - no build process required  
- **Files**: Platform API collection, Management API collection, environment variables
- **Usage**: Import into Postman for API testing

## Validation Scenarios

### claims-source-app
After making changes to the claims source:
1. **ALWAYS** run `npm install` if dependencies changed
2. **Test Express app**: Start with `node src/index.js` and verify endpoint responds
3. **Test API**: Use curl to verify claims endpoint returns expected user data
4. **Test authentication**: Verify endpoint returns 401 without proper API key
5. **Test database lookup**: Verify 404 response for non-existent email addresses

### verifier-web-tutorial  
After making changes to the verifier web app:
1. **ALWAYS** run `npm install` if dependencies changed
2. **Check configuration**: Ensure environment variables and placeholder values are properly configured
3. **Test development build**: `npm run dev` and verify app loads at http://localhost:3000
4. **Expected behavior without configuration**: App loads but shows "Error: Invalid initialize options" in browser console
5. **Test linting**: `npm run lint` - must pass for CI
6. **Production build**: Only attempt in environments with external network access
7. **UI testing**: If making UI changes, manually verify functionality in browser

### manual-revocation-check
After making changes to the revocation check script:
1. **Test argument validation**: Run without arguments to verify error message
2. **Test with mock data**: Verify script processes arguments correctly
3. **JSON syntax**: Ensure package.json remains valid (watch for trailing commas)

## Common Build Issues and Solutions

### Network Restrictions
- **Google Fonts failures**: Next.js builds may fail accessing fonts.googleapis.com
  - Solution: Use development mode instead of production build
- **External API calls**: Manual revocation check may fail accessing external revocation lists  
  - Expected behavior: Script should show "Fetching revocation list from URL failed"

### Docker Issues
- **Platform mismatch**: claims-source-app docker-compose.yml has incorrect platform setting
  - Solution: Remove `platform: linux/arm64` line or set to correct architecture
- **Docker build works**: Individual Docker builds succeed, compose may fail

### Missing Dependencies and Configuration
- **MATTR SDK**: React Native projects require private registry access
  - No workaround available without proper credentials
- **ngrok token**: Claims source requires token for tunneling
  - Workaround: Run Express app directly with `node src/index.js`
- **MATTR Platform credentials**: Verifier web tutorial requires:
  - Environment variable: `NEXT_PUBLIC_TENANT_URL`
  - Application ID and wallet provider ID configuration in source code
  - Without these: app runs but shows "Error: Invalid initialize options"

### JSON Syntax Issues  
- **Watch for trailing commas**: The manual-revocation-check had a trailing comma in package.json scripts
- **Validation**: Always check package.json syntax if npm install fails with JSON parse errors

## CI/CD Integration
- **CodeQL Analysis**: Runs on JavaScript files in CI
- **Template Checklist**: Automated PR checklist for credential template changes  
- **Linting requirement**: `npm run lint` must pass for verifier-web-tutorial
- **No automated testing**: Repository has no test suites configured

## Timing Expectations
- **npm install**: < 1 to 8 seconds depending on project
- **Docker builds**: 5 seconds  
- **Development servers**: < 1 second to start (Next.js ready in ~1 second)
- **Linting**: < 5 seconds
- **NEVER CANCEL**: All operations complete quickly, but allow 60+ seconds for any build process