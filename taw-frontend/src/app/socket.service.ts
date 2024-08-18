import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import {environments} from "../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private userId: string | null = null;

  constructor() {
    this.socket = io(environments.SOCKET_URL);

    // Rejoin the room when reconnected
    this.socket.on('connect', () => {
      if (this.userId) {
        console.log('Rejoining room');
        this.joinRoom(this.userId);
      }
    });
  }

  joinRoom(room: string) {
    this.userId = room;
    this.socket.emit('joinRoom', room);
  }

  sendMessage(room: string, message: string) {
    this.socket.emit('sendMessage', { room, message });
  }

  receiveMessage(callback: (message: string) => void) {
    this.socket.on('receiveMessage', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
