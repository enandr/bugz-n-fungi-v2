import React, {useContext, useEffect, useRef, useState} from 'react';
import Modal from 'react-modal';
import './App.scss';
import {SocketContext} from "./context/socketContext";
import useSocket from "./hooks/useSocket";
import {Simulate} from "react-dom/test-utils";
import play = Simulate.play;
const redCursor = require('./svgs/cursor-red.png')


type TileType = {
  owner: 0 | 1 | 2;
  row: number;
  column: number
  type: 'none' | 'bug' | 'fungi';
  isPlayable: boolean;
  surroundingTiles: TileType[]
  isAttachedToABug: boolean;
}

function App() {
  const socket = useContext(SocketContext);
  const [tilesState, setTilesState] = useState<any[]>([])
  const [playerTurn, setPlayerTurn] = useState<0 | 1 | 2>(0)
  const [playerNumber, setPlayerNumber] = useState<0 | 1 | 2>(0)
  const [turnCount, setTurnCount] = useState(0)
  const [player1Fungi, setPlayer1Fungi] = useState<TileType[]>([])
  const [player2Fungi, setPlayer2Fungi] = useState<TileType[]>([])
  const [mode, setMode] = useState(sessionStorage.mode || 'light')
  const [gameMode, setGameMode] = useState<'none' | 'local' | 'online'>('none')
  const [debugMode, setDebugMode] = useState(sessionStorage.debugMode === 'true')
  const [modalIsOpen, setIsOpen] = useState(true);
  const [joinModalIsOpen, setJoinModalIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [otherMouse, setOtherMouse] = useState<{x:string,y:string}>({x:'0px',y:'0px'})
  const [roomName, setRoomName] = useState<string>('')
  const tileGridRef = useRef<any>()
  const {joinRoom,createRoomId,sendClickedTile,sendUpdates} = useSocket(socket)

  function closeModal() {
    setIsOpen(false)
  }

  function GameTile(props: {tile: TileType}) {
    const {tile} = props;
    let className = 'tile '
    if (tile.type === 'bug') {
      className += `bug player${tile.owner} `
    }
    if (tile.type === 'fungi') {
      className += `fungi player${tile.owner} `
    }
    if (tile.isPlayable) {
      className += ' playableTile'
    }
    return  <div className={className} onClick={(event) => {
      if (event.shiftKey && debugMode) {
        console.log(tile)
        return;
      }
      if (!tile.isPlayable || playerTurn !== playerNumber) return;
      handleClick({row:tile.row,column:tile.column,player:playerTurn})
      //turnCount + 1 < 5 && sendUpdates({turnCount: turnCount + 1})
      sendClickedTile({row: tile.row, column: tile.column,player:playerTurn})
      setTurnCount(turnCount+1)
    }
    }>{tile.type === 'bug' ? 'B' : tile.type === 'fungi' ? 'F':''}
      {debugMode && <span className={'debugTileText'}>{`${tile.row}:${tile.column}`}</span>}
    </div>
  }

  function TileGrid() {
    return <div ref={tileGridRef} className={'grid'} onMouseMove={event => {
      if (!socket) return;
      socket.emit('mouseMove', {x:event.pageX - tileGridRef.current.offsetLeft, y:event.pageY- tileGridRef.current.offsetTop})
    }}>
      {gameMode === 'online' ? <img src={redCursor} className={'other-mouse'} style={{
        top: otherMouse.y,
        left: otherMouse.x,
        position:'relative',
        zIndex:1000,
      }} alt={'enemy-cursor'}/> : <div/>}

      {tilesState.map((row:any, index) => {
        return <div key={`ROW:${index}`} className={'row'}>
          {row.map((tile:TileType) => {
            return <GameTile key={`TILE:${tile.row}:${tile.column}`} tile={tile}/>
          })
          }
        </div>
      })}
    </div>
  }

  function setSurroundingTiles(state : any) {
    state.map((row: any[],rowIndex:number) => {
      row.map((tile:TileType,tileIndex:number) => {
          switch (tile.row) {
            case 0:
              switch (tile.column) {
                case 0:
                  tile.surroundingTiles.push(row[1])
                  tile.surroundingTiles.push(state[1][0])
                  tile.surroundingTiles.push(state[1][1])
                  break;
                case 9:
                  tile.surroundingTiles.push(row[8])
                  tile.surroundingTiles.push(state[1][8])
                  tile.surroundingTiles.push(state[1][9])
                  break;
                default:
                  tile.surroundingTiles.push(row[tile.column-1])
                  tile.surroundingTiles.push(row[tile.column+1])
                  tile.surroundingTiles.push(state[1][tile.column-1])
                  tile.surroundingTiles.push(state[1][tile.column])
                  tile.surroundingTiles.push(state[1][tile.column+1])
                  break;
              }
              break;
            case 9:
              switch (tile.column) {
                case 0:
                  tile.surroundingTiles.push(row[1])
                  tile.surroundingTiles.push(state[8][0])
                  tile.surroundingTiles.push(state[8][1])
                  break;
                case 9:
                  tile.surroundingTiles.push(row[8])
                  tile.surroundingTiles.push(state[8][9])
                  tile.surroundingTiles.push(state[8][8])
                  break;
                default:
                  tile.surroundingTiles.push(row[tile.column-1])
                  tile.surroundingTiles.push(row[tile.column+1])
                  tile.surroundingTiles.push(state[8][tile.column-1])
                  tile.surroundingTiles.push(state[8][tile.column])
                  tile.surroundingTiles.push(state[8][tile.column+1])
                  break;
              }
              break;
            default:
              switch (tile.column) {
                case 0:
                  tile.surroundingTiles.push(row[1])
                  tile.surroundingTiles.push(state[tile.row - 1][0])
                  tile.surroundingTiles.push(state[tile.row - 1][1])
                  tile.surroundingTiles.push(state[tile.row + 1][0])
                  tile.surroundingTiles.push(state[tile.row + 1][1])
                  break;
                case 9:
                  tile.surroundingTiles.push(row[8])
                  tile.surroundingTiles.push(state[tile.row - 1][8])
                  tile.surroundingTiles.push(state[tile.row - 1][9])
                  tile.surroundingTiles.push(state[tile.row + 1][8])
                  tile.surroundingTiles.push(state[tile.row + 1][9])
                  break;
                default:
                  tile.surroundingTiles.push(row[tile.column-1])
                  tile.surroundingTiles.push(row[tile.column+1])
                  tile.surroundingTiles.push(state[tile.row - 1][tile.column-1])
                  tile.surroundingTiles.push(state[tile.row - 1][tile.column])
                  tile.surroundingTiles.push(state[tile.row - 1][tile.column+1])
                  tile.surroundingTiles.push(state[tile.row + 1][tile.column-1])
                  tile.surroundingTiles.push(state[tile.row + 1][tile.column])
                  tile.surroundingTiles.push(state[tile.row + 1][tile.column+1])
                  break;
              }
              break;
          }
      })
    })
  }

  function resetPlayableTiles() {
    const newState = [...tilesState]
    newState.map((row,rowIndex:number) => {
      row.map((tile:TileType,tileIndex:number) => {
        tile.isPlayable = false;
        tile.isAttachedToABug = false;
      })
    })
    setTilesState(newState)
  }

  function checkFungiConnections(tile:TileType) {
    tile.surroundingTiles.map((surroundingTile:TileType) => {
      if (surroundingTile.type === 'fungi' && surroundingTile.owner === playerTurn && !surroundingTile.isAttachedToABug) {
        surroundingTile.isAttachedToABug = true;
        checkFungiConnections(surroundingTile);
      }
    })
  }

  function runCheckFungiLoop(newState: any) {
    newState.map((row: TileType[],rowIndex:number) => {
      row.map((tile:TileType,tileIndex:number) => {
        if (tile.owner === playerTurn) {
          if (tile.type === 'fungi'){
            tile.surroundingTiles.map((surroundingTile:TileType) => {
              if (surroundingTile.type === 'bug' && surroundingTile.owner === playerTurn) {
                tile.isAttachedToABug = true;
                checkFungiConnections(tile)
              }
            })
          }
        }
      })
    })
  }

  function findPlayableTiles() {
    if (!tilesState.length) return;
    resetPlayableTiles()
    const newState = [...tilesState]
    let canPlay = false;
    runCheckFungiLoop(newState);

    newState.map((row,rowIndex:number) => {
      row.map((tile:TileType,tileIndex:number) => {
        if (tile.owner === playerTurn) {
          if (tile.type === 'fungi') {
            if (tile.isAttachedToABug) {
              tile.surroundingTiles.map((surroundingTile:TileType) => {
                if (surroundingTile.type === 'none' || (surroundingTile.type === 'bug' && surroundingTile.owner !== playerTurn)) {
                  surroundingTile.isPlayable = true;
                  canPlay = true
                }
              })
            }
          } else {
            tile.surroundingTiles.map((surroundingTile:TileType) => {
              if (surroundingTile.type === 'none' || (surroundingTile.type === 'bug' && surroundingTile.owner !== playerTurn)) {
                surroundingTile.isPlayable = true;
                canPlay = true
              }
            })
          }
        }
      })
    })
    setTilesState(newState)
    if (!canPlay) {
      alert(`Player ${playerTurn === 1 ? 2 : 1} has won!!!`)
    }
  }

  function handleClick(tile:{row:number;column:number,player: 0 | 1 | 2}) {
    const {row,column,player} = tile;
    const newState = [...tilesState]
    const currentTile = newState[row][column]
    currentTile.owner = player
    currentTile.type = currentTile.type === 'none' ? 'bug' : 'fungi';
    if (currentTile.type === 'fungi') {
      switch (currentTile.owner){
        case 1:
          setPlayer1Fungi([...player1Fungi,currentTile])
          break;
        case 2:
          setPlayer2Fungi([...player2Fungi,currentTile])
          break;
      }
    }
    setTilesState(newState);
    findPlayableTiles()
  }

  useEffect(() => {
    const initialState = []
    for (let i=0; i<10; i++) {
      const tileRow = []
      for (let o=0; o<10; o++) {
        const data:TileType = {owner:0,type:'none',isPlayable: false, row: i, column:o,surroundingTiles:[],isAttachedToABug:false}
        tileRow.push(data)
      }
      initialState.push(tileRow)
    }
    initialState[0][0].owner = 1
    initialState[0][0].type = 'bug'
    initialState[9][9].owner = 2
    initialState[9][9].type = 'bug'
    setSurroundingTiles(initialState)
    setTilesState(initialState)
    setPlayerTurn(1);
  },[])

  useEffect(() => {
    if (socket && gameMode === 'online') {
    }
  },[gameMode])

  useEffect(() => {
    if (!loaded) {
      setLoaded(true)
    }
  },[tilesState])

  useEffect(() => {
    socket.on('connect',() => {
      setConnected(true)
      socket.on('playerSet', (data) => {
        setPlayerNumber(data)
      })
      socket.on('mouseMove', (data) => {
        setOtherMouse(data)
      })
      socket.on('clickTile', (data) => {
        if (tilesState.length){
          handleClick(data)
        }
      })
      socket.on('updates', (data) => {
        data.turnCount && setTurnCount(data.turnCount)
        data.playerTurn && setPlayerTurn(data.playerTurn)
      })
    })
    if (turnCount >4) {
      sendUpdates({turnCount: 0})
      setTurnCount(0)
      setPlayerTurn(playerTurn === 1 ? 2 : 1)
      findPlayableTiles()
    } else {
      sendUpdates({turnCount: turnCount})
      findPlayableTiles()
    }
    //findPlayableTiles()
  },[loaded,turnCount])

  useEffect(() => {
    sendUpdates({ playerTurn:playerTurn})
    setTurnCount(0)
    findPlayableTiles()
  },[playerTurn])

  useEffect(() => {
    sessionStorage.mode = mode;
    sessionStorage.debugMode = debugMode;
  },[mode,debugMode])


  return (
    <div className={`App ${mode === 'dark' && 'dark'}`}>
      <div className={'headers'}>
        <h3>Turn: {turnCount +1}</h3>
        {roomName && <h3 className={"roomName"} onClick={async () => {
          await navigator.clipboard.writeText(roomName);
          console.log('copied')
        }
        }>{roomName}</h3>}
        <h3 onClick={() => {
          debugMode && console.log(tilesState)
        }}>Player: {playerTurn}</h3>
      </div>
      <TileGrid />
      <button onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light')
      }}>Toggle {mode === 'light' ? 'dark' : 'light'} Mode</button>
      <button onClick={() => {
        setDebugMode(!debugMode)
      }}>Debug Mode {debugMode ? 'ON' : 'OFF'}</button>
      <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
          ariaHideApp={false}
      >
        <h2>Bugz N Fungi</h2>
        <div>Which Mode</div>
        <button onClick={() => {
          closeModal()
          setGameMode('local')
        }}>Local Multiplayer</button>
        <button disabled={!connected} onClick={() => {
          closeModal()
          setJoinModalIsOpen(true)
        }}>Online Multiplayer</button>
      </Modal>
      <Modal
          isOpen={joinModalIsOpen}
          onRequestClose={closeModal}
          contentLabel="JOIN OR CREATE ROOM"
          ariaHideApp={false}
      >
        <h2>Join or create room</h2>
        <input value={roomName} onChange={(val) => {
          setRoomName(val.currentTarget.value)
        }} placeholder={'Room Name'}/>
        <button disabled={roomName.split('-').length < 3} onClick={() => {
          setJoinModalIsOpen(false)
          setGameMode('online')
          joinRoom(roomName)
        }}>Join Room</button>
        <button disabled={!connected} onClick={() => {
          setJoinModalIsOpen(false)
          setGameMode('online')
          const roomId = createRoomId()
          setRoomName(roomId)
          joinRoom(roomId)
          /*socket.emit('joinRoom',{
            room: 'room1'
          })*/
        }}>Create Room</button>
      </Modal>
    </div>
  );
}

export default App;
