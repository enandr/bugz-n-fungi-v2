import React, {createContext, useState} from "react"
/*{tilesState,setTilesState,playerTurn,setPlayerTurn,playerNumber,setPlayerNumber,turnCount,setTurnCount,player1Fungi,setPlayer1Fungi,player2Fungi,setPlayer2Fungi,mode,setMode,gameMode,setGameMode,debugMode,setDebugMode,modalIsOpen,setIsOpen,joinModalIsOpen,setJoinModalIsOpen,loaded,setLoaded,connected,setConnected,otherMouse,setOtherMouse,roomName,setRoomName}*/



export const StateContext = createContext({});
const {Provider} = StateContext
export default function GlobalState(props: any) {
    const {children} = props;
    const [tilesState, setTilesState] = useState<any[]>([])
    const [playerTurn, setPlayerTurn] = useState<0 | 1 | 2>(0)
    const [playerNumber, setPlayerNumber] = useState<0 | 1 | 2>(0)
    const [turnCount, setTurnCount] = useState(0)
    const [mode, setMode] = useState(sessionStorage.mode || 'light')
    const [gameMode, setGameMode] = useState<'none' | 'local' | 'online'>('none')
    const [debugMode, setDebugMode] = useState(sessionStorage.debugMode === 'true')
    const [modalIsOpen, setIsOpen] = useState(true);
    const [joinModalIsOpen, setJoinModalIsOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [connected, setConnected] = useState(false);
    const [otherMouse, setOtherMouse] = useState<{x:string,y:string}>({x:'0px',y:'0px'})
    const [roomName, setRoomName] = useState<string>('')

    return <Provider value={{tilesState,setTilesState,playerTurn,setPlayerTurn,playerNumber,setPlayerNumber,turnCount,setTurnCount,mode,setMode,gameMode,setGameMode,debugMode,setDebugMode,modalIsOpen,setIsOpen,joinModalIsOpen,setJoinModalIsOpen,loaded,setLoaded,connected,setConnected,otherMouse,setOtherMouse,roomName,setRoomName}}>{children}</Provider>
}
