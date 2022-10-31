import React, {createContext, useState} from "react"
/*{tilesState,setTilesState,playerTurn,setPlayerTurn,playerNumber,setPlayerNumber,turnCount,setTurnCount,player1Fungi,setPlayer1Fungi,player2Fungi,setPlayer2Fungi,mode,setMode,gameMode,setGameMode,debugMode,setDebugMode,modalIsOpen,setIsOpen,joinModalIsOpen,setJoinModalIsOpen,loaded,setLoaded,connected,setConnected,otherMouse,setOtherMouse,roomName,setRoomName}*/


export type StateType = {
    tilesState?: any[];
    setTilesState?: React.Dispatch<React.SetStateAction<any[]>>;
    playerTurn?: 0 | 2 | 1;
    setPlayerTurn?: React.Dispatch<React.SetStateAction<0 | 2 | 1>>;
    turnCount?: number;
    setTurnCount?: React.Dispatch<React.SetStateAction<number>>
}

export const StateContext = createContext<StateType>({});
const {Provider} = StateContext
export default function GlobalState(props: any) {
    const {children} = props;
    const [tilesState, setTilesState] = useState<any[]>([])
    const [playerTurn, setPlayerTurn] = useState<0 | 1 | 2>(0)
    const [turnCount, setTurnCount] = useState(0)

    return <Provider value={{tilesState, setTilesState,playerTurn, setPlayerTurn,turnCount, setTurnCount}}>{children}</Provider>
}
