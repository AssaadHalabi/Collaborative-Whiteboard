# Collaboard
This project is a collaborative drawing application inspired by TLDraw, built using React, Node.js, Express, Socket.IO, and Postgresql. It allows multiple users to draw on a shared canvas in real-time.

## Features

- Real-time collaborative drawing
- Persistent storage of drawings in Postgresql
- User authentication (to be implemented)
- Support for multiple drawing tools (to be implemented)
- Undo/redo functionality (to be implemented)

## Prerequisites

- Node.js
- Socket.io
- React
- Prisma
- Postgresql

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AssaadHalabi/Collaborative-Whiteboard.git
   cd Collaborative-Whiteboard
   ```

2. Install server dependencies:

   ```bash
    cd Backend
    npm install
   ```

3. Install client dependencies:

   ```bash
    cd Frontend
    npm install
   ```


## Running the Application
### Start the Server

1. Ensure Postgresql is running on your local machine or provide a connection string for a remote Postgresql instance.

### Database generation:
1. Intialize prisma
   ```bash
    cd Backend
    npx prisma init
   ```
2. Add your Postgresql DATABASE_URL to the created .env file

3. Generate the database schema and prisma client
   ```bash
    npm run dbgen
   ```
4. Start the server
   ```bash
    node server.js
   ```

### Start the Client
### Start the React development server:

   ```bash
    cd Frontend
    npm start
   ```

Open your browser and navigate to http://localhost:3000.