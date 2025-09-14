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
- ngrok installed for local development tunneling ([download here](https://ngrok.com/download))
- Basic knowledge of React and Next.js

## Quick Start

```bash
# 1. Clone the repository
git clone [repository-url]
cd interaction-hook-app

# 2. Install dependencies
npm install

# 3. Create environment file
touch .env.local

# 4. Configure MATTR VII interaction hook and get the secret

# 5. Update .env.local with your values

# 6. Start ngrok tunnel
ngrok http 3000

# 7. Update APP_URL in .env.local with ngrok URL

# 8. Update interaction hook URL in MATTR VII

# 9. Start development server
npm run dev
```

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
├── .env-example                      # Environment template
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
