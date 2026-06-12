import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket && token) {
    socket = io(window.location.origin, {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket as Socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
