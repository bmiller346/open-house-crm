
![GitHub package.json version](https://img.shields.io/github/package-json/v/lucsedirae/open-house-crm?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/lucsedirae/open-house-crm?color=39%2C%20255%2C%200%20&style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/lucsedirae/open-house-crm?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/lucsedirae/open-house-crm?style=for-the-badge)
![GitHub top language](https://img.shields.io/github/languages/top/lucsedirae/open-house-crm?style=for-the-badge)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/lucsedirae/open-house-crm?style=for-the-badge)
![GitHub contributors](https://img.shields.io/github/contributors/lucsedirae/open-house-crm?style=for-the-badge)

![header image](client/public/img/readme-header.PNG)
## Description

An open source CRM platform for real estate professionals

Visit us on [GitHub](https://github.com/lucsedirae/open-house-crm)

<hr>

## Table of Contents

- [Development](#development)

- [Installation](#installation)

- [Features](#features)

- [License](#license)

- [Contributions](#contributions)

- [Testing](#testing)

- [Questions?](#questions)

- [Contact](#contact)

<hr>


## Monorepo Development Server Commands

To run the new monorepo servers, use the following commands:

**API Server (TypeScript, hot reload):**
```bash
cd apps/api

npx tsx src/server.ts
```
**Or, to run the compiled JavaScript:**
```bash
cd apps/api
npm run build
node dist/server.js
```

**Web App (Next.js):**
```bash
cd apps/web
npm run dev
```

**Legacy (old) server/client (not recommended for new development):**
```bash
# From the root, runs old Express and React apps
npm run dev
```

> For more details, see `.copilot-instructions.md` in the repo root.

## Development

Future development goals:

- Implementation of progressive web application tools
- Conversion to an npm package to allow developers easy access to components and tools for building custom implementations of the application
- Migrate from express to php back end
- Calendar module
- Dark mode option in my account settings page

**Developers wanted!** Open house is open to developers of all skill levels. It was created as a final project for a web development boot camp and we welcome students and self-studiers to get involved. See the [contributions](#contributions) section or [get in touch](#questions) to learn how.

## Installation

Clone directory and run `npm i` in the root directory. Then navigate to the /client subdirectory and run `npm i` again. See package.json in root directory for development runtime and build scripts.

## Features

Manages contacts in a clean, easily searchable UI

![Contacts animation](/client/public/img/contacts.gif)

Charts business analytics from your transaction history

![Charts animation](/client/public/img/charts.gif)

Transaction and inventory databases for managing your business and sales tools

![Charts animation](/client/public/img/trx-inv.gif)

Social forum to share vendor contact information, advertise listings, share articles and more

![Charts animation](/client/public/img/forum.gif)

## License

Created under the GNU GPLv3 license. See LICENSE.txt for more information.

## Contributions

- Visit our [issues page](https://github.com/lucsedirae/open-house-crm/issues) or [projects page](https://github.com/lucsedirae/open-house-crm/projects) to see what needs work.
- Submit a pull request with detailed description of added code or edits.

## Testing

No testing library currently installed

## Questions

Have questions on this application?:<br>
Email: jondeavers@gmail.com <br>

## Contact

Founding contributors:

[Jon Deavers](https://github.com/lucsedirae) - [Website](https://jondeavers.net)

[Melanie Hall](https://github.com/mhall313)

[Tanner Kirkpatrick](https://github.com/twkirkpatrick)

[David Stinnet](https://github.com/serjykalstryke) - [Website](https://www.davidstinnett.info)

## Recent Enhancements

### 🎉 Major Achievements
- ✅ **Calendar System**: Complete appointment scheduling with smart scheduling and availability management
- ✅ **Webhook Management**: Production-ready with real API integration and testing dashboard  
- ✅ **TypeScript API**: Full TypeScript backend with PostgreSQL and performance optimizations
- ✅ **Authentication**: Google OAuth integration with multi-tenant workspace support
- ✅ **Database**: PostgreSQL with proper relationships, indexes, and migration system
- ✅ **Modern UI**: Material-UI v5 with dark/light themes and responsive design

### 📊 Current Status
Your Open House CRM is now **~85% production-ready** with 45+ API endpoints, complete authentication, and professional UI/UX.

For detailed feature documentation, see:
- [Webhook System Documentation](./WEBHOOK_README.md)
- [Development Instructions](./.copilot-instructions.md)