import { Socket, io } from 'socket.io-client';

export class SocketService {
  private socket: Socket | null = null;
  private readonly socketUrl: string;

  constructor() {
    this.socketUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:6970";
  }

  connect(playerId?: string, gameId?: string) {
    if (this.socket) return;

    this.socket = io(this.socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: { playerId, gameId }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  getSocket() {
    return this.socket;
  }
}