import React, {useEffect, useState} from 'react';
import './App.scss';

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
  const [tilesState, setTilesState] = useState<any[]>([])

  const [playerTurn, setPlayerTurn] = useState<0 | 1 | 2>(0)

  const [turnCount, setTurnCount] = useState(0)

  const [player1Fungi, setPlayer1Fungi] = useState<TileType[]>([])

  const [player2Fungi, setPlayer2Fungi] = useState<TileType[]>([])

  const [mode, setMode] = useState(sessionStorage.mode || 'light')

  const [debugMode, setDebugMode] = useState(sessionStorage.debugMode === 'true')

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
      if (!tile.isPlayable) return;
      const newState = [...tilesState]
      const currentTile = newState[tile.row][tile.column]
      currentTile.owner = playerTurn
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
      setTurnCount(turnCount+1)
      findPlayableTiles()
    }
    }>{debugMode && `${tile.row}:${tile.column}`}</div>
  }

  function TileGrid() {
    return <div className={'grid'}>
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

    runCheckFungiLoop(newState);

    newState.map((row,rowIndex:number) => {
      row.map((tile:TileType,tileIndex:number) => {
        if (tile.owner === playerTurn) {
          if (tile.type === 'fungi') {
            if (tile.isAttachedToABug) {
              tile.surroundingTiles.map((surroundingTile:TileType) => {
                if (surroundingTile.type === 'none' || (surroundingTile.type === 'bug' && surroundingTile.owner !== playerTurn)) {
                  surroundingTile.isPlayable = true;
                }
              })
            }
          } else {
            tile.surroundingTiles.map((surroundingTile:TileType) => {
              if (surroundingTile.type === 'none' || (surroundingTile.type === 'bug' && surroundingTile.owner !== playerTurn)) {
                surroundingTile.isPlayable = true;
              }
            })
          }
        }
      })
    })
    setTilesState(newState)
  }

  function checkWinCondition() {

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
    if (turnCount === 5) {
      setTurnCount(0)
      setPlayerTurn(playerTurn === 1 ? 2 : 1)
      findPlayableTiles()
    }
  },[turnCount])

  useEffect(() => {
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
    </div>
  );
}

export default App;
