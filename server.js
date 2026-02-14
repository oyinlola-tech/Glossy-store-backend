require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { app, initializeDatabase } = require('./src/app');
const { setupSupportSocket } = require('./src/socket/supportSocket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeDatabase();
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
    });

    app.set('io', io);
    setupSupportSocket(io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

startServer();
