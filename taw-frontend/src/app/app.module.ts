import {io, Socket} from "socket.io-client"

import axios from 'axios';
import {environments} from "../environments/environments";

let email = '';
let status;

let socket: Socket<any, any> | null;

axios.get(environments.BACKEND_URL + '/api/auth/me').then((res) => {
  status = res.status;
  email = res.data.email;
  socket = status === 200 ? io(environments.SOCKET_URL, {
    withCredentials: true,
    extraHeaders: {
      jwt: localStorage.getItem("jwt") || "",
    },
    query: {
      roomName: email,
    }
  }): null;

  console.log(socket)
}).catch((err) => {
  console.log(err);
  socket = null;
});

export {socket};

