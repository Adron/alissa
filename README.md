# Alissa Web Viewer

An Electron-based image viewer application that works on Windows, macOS, and Linux.

## Features

- Cross-platform support (Windows, macOS, Linux)
- Full-screen viewing mode
- Image preview and floating image windows
- Select/Deselect functionality
- Settings management
- Documentation and About sections

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To run the application in development mode:

```bash
npm start
```

### Building the Application

To build the application for your platform:

```bash
npm run build
```

The built application will be available in the `dist` directory.

## Menu Structure

### File
- Settings
- Exit

### View
- Full Screen
- Image Preview
- Floating Image

### Actions
- Select All
- Deselect All

### Help
- About
- Docs

## License

ISC 