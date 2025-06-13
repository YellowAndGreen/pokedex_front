# Pokedex Image Manager - Desktop Edition

This application is now a desktop app built with Electron. It allows you to manage your Pokemon image collection offline.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app in development mode:
   - Start the Vite dev server: `npm run dev`
   - In a new terminal, start the Electron app: `npm run start`

## Build for Production

To build the app for your platform:

`npm run build && npm run dist`

This will create an installer in the `dist_electron` directory.

## Features

- Offline image management
- Native desktop experience
- Automatic updates
