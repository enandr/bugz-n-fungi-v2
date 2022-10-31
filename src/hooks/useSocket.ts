import React, { useState, useEffect } from 'react';
const randomWords = require('random-words');

export default function useSocket(socket:any) {
    const joinRoom = (roomId:string) => {
        socket.emit('joinRoom',{
            room: roomId
        })
    }
    const sendCursorLocation = () => {
        console.log('send cursor location')
    }
    const sendClickedTile = (data:any) => {
        //console.log(JSON.stringify(state))
        socket.emit('clickTile',data)
    }
    const sendUpdates = (data:any) => {
        socket.emit('updates',data)
    }
    const createRoomId = () => {
        return randomWords(3).join('-')
    }


    return {
        joinRoom,
        createRoomId,
        sendCursorLocation,
        sendClickedTile,
        sendUpdates
    }
}
