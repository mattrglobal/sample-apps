# MATTR VII Interaction Hook Tutorial

## Overview

This tutorial demonstrates how to build an **Interaction Hook** for MATTR VII - a custom web component that integrates into the credential issuance flow. Interaction hooks allow you to:

- 🎨 Create custom UI for collecting user information
- 🔄 Transform or enrich credential claims
- 🎯 Implement business logic during issuance

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Resources](#resources)

## Prerequisites

- Node.js 20+ and npm
- MATTR VII tenant account with access to create interaction hooks
- [ngrok](https://ngrok.com/download) account and auth token for local development tunneling
- Basic knowledge of React and Next.js

## Quick Start

```bash
# 1. Clone the repository
git clone [repository-url]
cd interaction-hook-app

# 2. Install dependencies
npm install

# 3. Create environment file from template
cp env-template .env

# 4. Configure MATTR VII interaction hook and get the secret

# 5. Update .env with your values (including NGROK_AUTHTOKEN)

# 6. Start the development server (automatically starts ngrok tunnel)
npm run dev

# 7. Copy the ngrok URL from the TUNNEL output and update APP_URL in .env

# 8. Update interaction hook URL in MATTR VII with the ngrok URL
```

> **Note:** `npm run dev` starts both the ngrok tunnel and the Next.js dev server concurrently.
> Use `npm run dev:app` to start only the Next.js dev server without the tunnel.

## Project Structure

```
interaction-hook-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main UI component
│   │   ├── api/
│   │   │   └── interaction-hook/
│   │   │       └── route.ts         # API handler
│   │   ├── layout.tsx               # App layout
│   │   └── globals.css              # Global styles
│   ├── tunnel.mjs                   # ngrok tunnel setup
│   └── check-port.mjs              # Port availability check
├── env-template                      # Environment template
├── package.json                      # Dependencies
└── README.md                         # This file
```

## Resources

- [MATTR VII Documentation](https://learn.mattr.global)
- [Interaction Hook Guide](https://learn.mattr.global/guides/oid4vci/interaction-hook-tutorial)
- [Next.js Documentation](https://nextjs.org/docs)
- [JWT.io](https://jwt.io) - JWT debugging tool
- [ngrok Documentation](https://ngrok.com/docs)

**Built with ❤️ by the MATTR Labs team**
