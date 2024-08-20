import {Injectable} from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {environments} from "../environments/environments";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private static userId: string | null = null;

  constructor() {
    this.socket = io(environments.SOCKET_URL);

    // Rejoin the room when reconnected
    this.socket.on('connect', () => {
      console.log('Connected to socket');
      if (SocketService.userId) {
        console.log('Rejoining room');
        this.joinRoom(SocketService.userId);
      }
    });
  }

  joinRoom(room: string) {
    console.log('Joining room');

    SocketService.userId = room;
    this.socket.emit('joinRoom', room);
  }

  sendMessage(room: string, message: string) {
    this.socket.emit('sendMessage', {room, message});
  }


  receiveMessage(callback: (message: any) => void) {
    console.log('Receiving message');
    this.socket.on('notification', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
