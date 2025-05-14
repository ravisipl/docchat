# DocChat Admin Frontend

This is the admin frontend for the DocChat application, built with React, TypeScript, and Material-UI.

## Features

- Dashboard with statistics overview
- User management (view, toggle admin status, toggle active status)
- Document management (view, download, delete)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:

```
REACT_APP_API_URL=http://localhost:8000
```

## Running the Application

1. Start the development server:

```bash
npm start
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## API Endpoints

The admin frontend expects the following API endpoints to be available:

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/toggle-admin` - Toggle admin status
- `PATCH /api/admin/users/:id/toggle-active` - Toggle active status
- `GET /api/admin/documents` - Get all documents
- `DELETE /api/admin/documents/:id` - Delete a document
- `GET /api/admin/documents/:id/download` - Download a document

## Development

The project uses:

- React 18
- TypeScript
- Material-UI
- React Router
- Axios for API calls
