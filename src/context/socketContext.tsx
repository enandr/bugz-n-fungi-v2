import React, {createContext} from "react"
import {io} from 'socket.io-client'
export const socket = io('https://bugz-n-fungi-server.herokuapp.com/')
export const SocketContext = createContext(socket);
