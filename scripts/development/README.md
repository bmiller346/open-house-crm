# Development Scripts

This directory contains development automation scripts for the Open House CRM project.

## Start Scripts

- **START_DEV.bat** - Main development environment launcher (starts both server and client)
- **start-server.bat** - Start Express server only
- **start-client.bat** - Start React client only
- **start-dev.bat** - Alternative development starter
- **start-react.bat** - Start React application
- **start-react-direct.ps1** - PowerShell script for React startup

## Setup & Installation

- **install-deps.bat** - Install dependencies (batch version)
- **install-deps.ps1** - Install dependencies (PowerShell version)
- **npm-wrapper.ps1** - NPM wrapper script for PowerShell

## Database & Infrastructure

- **reset-postgres-password.ps1** - Reset PostgreSQL password utility

## Usage

The main entry point for development is `START_DEV.bat` which will:
1. Start the Express server on port 8080
2. Start the React client on port 3000
3. Open both in separate terminal windows

For individual component startup, use the specific start scripts as needed.

---

*These scripts are maintained for local development convenience and contain environment-specific paths.*
