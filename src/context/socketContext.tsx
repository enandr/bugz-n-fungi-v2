import React, {createContext} from "react"
import {io} from 'socket.io-client'
export const socket = io('http://localhost:4444')
export const SocketContext = createContext(socket);
