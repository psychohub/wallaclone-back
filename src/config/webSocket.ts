import http from 'node:http';
import { Server } from 'socket.io';

export const connectWebSocket = (
  app: http.RequestListener<typeof http.IncomingMessage, typeof http.ServerResponse> | undefined,
) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return server;
};
