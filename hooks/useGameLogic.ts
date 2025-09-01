
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { BoardState, Move, WinInfo, GameMemory, MoveHistoryItem } from '../types';
import { Player, GameMode, Difficulty } from '../types';
import { BOARD_SIZE, PLAYER_X, PLAYER_O, AI_PLAYER, HUMAN_PLAYER, POSITIONAL_VALUE_MAP } from '../constants';

// --- Pure Helper Functions ---

const createInitialBoard = (): BoardState => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

const isOnWall = (r: number, c: number): boolean => r === 0 || r === BOARD_SIZE - 1 || c === 0 || c === BOARD_SIZE - 1;

const isValidMove = (r: number, c: number, board: BoardState, movesMade: number): boolean => {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c]) {
        return false;
    }
    if (movesMade === 0) return isOnWall(r, c);
    if (isOnWall(r, c)) return true;

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of directions) {
        let pathIsGood = true;
        let hasPiece = false;
        let cr = r + dr;
        let cc = c + dc;
        while (cr >= 0 && cr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE) {
            if (board[cr][cc]) {
                hasPiece = true;
            } else {
                pathIsGood = false;
                break;
            }
            cr += dr;
            cc += dc;
        }
        if (hasPiece && pathIsGood) return true;
    }

    return false;
};

const getValidMoves = (board: BoardState, movesMade: number): Move[] => {
    const moves: Move[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (isValidMove(r, c, board, movesMade)) {
                moves.push({ r, c });
            }
        }
    }
    return moves;
};

const checkWin = (player: Player, board: BoardState): WinInfo => {
    // Directions to check: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
        { r: 0, c: 1 },
        { r: 1, c: 0 },
        { r: 1, c: 1 },
        { r: 1, c: -1 },
    ];

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== player) {
                continue;
            }

            for (const dir of directions) {
                const line: Move[] = [{ r, c }];
                for (let i = 1; i < 4; i++) {
                    const nextR = r + i * dir.r;
                    const nextC = c + i * dir.c;
                    if (
                        nextR >= 0 && nextR < BOARD_SIZE &&
                        nextC >= 0 && nextC < BOARD_SIZE &&
                        board[nextR][nextC] === player
                    ) {
                        line.push({ r: nextR, c: nextC });
                    } else {
                        break;
                    }
                }

                if (line.length === 4) {
                    // Found a win. Now, extend the line in both directions.
                    // Extend backwards from the starting point
                    let prevR = r - dir.r;
                    let prevC = c - dir.c;
                    while (
                        prevR >= 0 && prevR < BOARD_SIZE &&
                        prevC >= 0 && prevC < BOARD_SIZE &&
                        board[prevR][prevC] === player
                    ) {
                        line.unshift({ r: prevR, c: prevC });
                        prevR -= dir.r;
                        prevC -= dir.c;
                    }
                    
                    // Extend forwards from the last piece of the initial 4
                    const lastPiece = line[line.length - 1];
                    let nextR = lastPiece.r + dir.r;
                    let nextC = lastPiece.c + dir.c;
                     while (
                        nextR >= 0 && nextR < BOARD_SIZE &&
                        nextC >= 0 && nextC < BOARD_SIZE &&
                        board[nextR][nextC] === player
                    ) {
                        line.push({ r: nextR, c: nextC });
                        nextR += dir.r;
                        nextC += dir.c;
                    }
                    
                    return line;
                }
            }
        }
    }

    return null; // No win found
};


// --- The Custom Hook ---

export const useGameLogic = () => {
    const [board, setBoard] = useState<BoardState>(createInitialBoard);
    const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER_X);
    const [nextStarter, setNextStarter] = useState<Player>(PLAYER_O);
    const [movesMade, setMovesMade] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [winInfo, setWinInfo] = useState<WinInfo>(null);
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.PvC);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [scores, setScores] = useState({ [PLAYER_X]: 0, [PLAYER_O]: 0 });
    const [isThinking, setIsThinking] = useState(false);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);
    const [gameMemory, setGameMemory] = useState<GameMemory>({ wins: [], losses: [] });
    const isSimulatingRef = useRef(false);
    const [simulationStatus, setSimulationStatus] = useState('');
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
    const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false);
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            return localStorage.getItem('cazConnectMuted') === 'true';
        } catch {
            return false;
        }
    });
    
    // --- Sound Logic ---
    const placeSound = useRef<HTMLAudioElement | null>(null);
    const winSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        placeSound.current = new Audio('./place.mp3');
        winSound.current = new Audio('./win.mp3');
    }, []);

    const playSound = useCallback((soundType: 'place' | 'win') => {
        if (isMuted) return;
        const sound = soundType === 'place' ? placeSound.current : winSound.current;
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.error(`Error playing ${soundType}-sound:`, e));
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prevMuted => {
            const newMuted = !prevMuted;
            try {
                localStorage.setItem('cazConnectMuted', String(newMuted));
            } catch (error) {
                console.error("Failed to save mute state to localStorage", error);
            }
            return newMuted;
        });
    }, []);

    // --- PWA Install Prompt ---
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const showInstallPrompt = () => {
        if (deferredInstallPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallPromptVisible(true);
        }
    };

    const triggerInstallPrompt = () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then(() => {
                setDeferredInstallPrompt(null);
                setIsInstallPromptVisible(false);
            });
        }
    };
    
    // --- Game State & Reset Logic ---
    useEffect(() => {
        try {
            const savedMemory = localStorage.getItem('cazConnectMemory');
            if (savedMemory) {
                setGameMemory(JSON.parse(savedMemory));
            }
        } catch (error) {
            console.error("Failed to load AI memory from localStorage", error);
        }
    }, []);
    
    const masterReset = useCallback((startPlayer: Player) => {
        setBoard(createInitialBoard());
        setCurrentPlayer(startPlayer);
        setMovesMade(0);
        setGameOver(false);
        setWinInfo(null);
        setLastMove(null);
        setMoveHistory([]);
        setIsInstallPromptVisible(false);
        setIsThinking(false);
    }, []);
    
    const resetGame = useCallback(() => {
        masterReset(nextStarter);
        setNextStarter(s => s === PLAYER_X ? PLAYER_O : PLAYER_X);
    }, [nextStarter, masterReset]);
    
    useEffect(() => {
        masterReset(PLAYER_X);
        setNextStarter(PLAYER_O);
    }, [gameMode, difficulty, masterReset]);
        
    const validMoves = useMemo(() => getValidMoves(board, movesMade), [board, movesMade]);

    const recordGameResult = (history: MoveHistoryItem[], winner: Player | null) => {
        const moveString = history.map(m => `${m.player}:${m.r},${m.c}`).join(';');
        setGameMemory(prevMemory => {
            const newMemory = { ...prevMemory };
            if (winner === AI_PLAYER) {
                if (!newMemory.wins.some(w => w.moves === moveString)) {
                    newMemory.wins = [...newMemory.wins, { moves: moveString }];
                }
            } else if (winner === HUMAN_PLAYER) {
                if (!newMemory.losses.some(l => l.moves === moveString)) {
                    newMemory.losses = [...newMemory.losses, { moves: moveString }];
                }
            }
            try {
                localStorage.setItem('cazConnectMemory', JSON.stringify(newMemory));
            } catch (error) {
                console.error("Failed to save AI memory to localStorage", error);
            }
            return newMemory;
        });
    };

    const makeMove = useCallback((r: number, c: number) => {
        if (gameOver || board[r][c]) return;

        playSound('place');

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = currentPlayer;
        setBoard(newBoard);

        const newMoveHistory = [...moveHistory, { player: currentPlayer, r, c }];
        setMoveHistory(newMoveHistory);
        
        setLastMove({ r, c });
        const newMovesMade = movesMade + 1;
        setMovesMade(newMovesMade);

        const winner = checkWin(currentPlayer, newBoard);
        if (winner) {
            setWinInfo(winner);
            setGameOver(true);
            setScores(s => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
            
            playSound('win');

            if (gameMode === GameMode.PvC) recordGameResult(newMoveHistory, currentPlayer);
             setTimeout(showInstallPrompt, 1500);
        } else if (getValidMoves(newBoard, newMovesMade).length === 0) {
            setGameOver(true);
            if (gameMode === GameMode.PvC) recordGameResult(newMoveHistory, null);
             setTimeout(showInstallPrompt, 1500);
        } else {
            setCurrentPlayer(p => (p === PLAYER_X ? PLAYER_O : PLAYER_X));
        }
    }, [board, currentPlayer, gameOver, movesMade, gameMode, moveHistory, playSound]);

    const handleCellClick = (r: number, c: number) => {
        if (isThinking || isSimulatingRef.current || gameOver) return;
        if (gameMode === GameMode.PvC && currentPlayer === AI_PLAYER) return;
        
        if (isValidMove(r, c, board, movesMade)) {
            makeMove(r, c);
        }
    };
    
    // --- AI Logic ---
    
    const scorePositionTactical = (currentBoard: BoardState, player: Player) => {
        let score = 0;
        const opponent = player === AI_PLAYER ? HUMAN_PLAYER : AI_PLAYER;

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                // Check all 4 directions from each cell
                [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(([dr, dc]) => {
                    // Ensure the 4-cell window is on the board
                    if (r + 3 * dr < BOARD_SIZE && r + 3 * dr >= 0 && c + 3 * dc < BOARD_SIZE && c + 3 * dc >= 0) {
                        const window = [
                            currentBoard[r][c],
                            currentBoard[r + dr][c + dc],
                            currentBoard[r + 2 * dr][c + 2 * dc],
                            currentBoard[r + 3 * dr][c + 3 * dc]
                        ];

                        const playerCount = window.filter(p => p === player).length;
                        const opponentCount = window.filter(p => p === opponent).length;
                        const emptyCount = window.filter(p => p === null).length;

                        // Offensive scoring
                        if (playerCount === 4) {
                            score += 100000;
                        } else if (playerCount === 3 && emptyCount === 1) {
                            score += 100;
                        } else if (playerCount === 2 && emptyCount === 2) {
                            score += 10;
                        }

                        // More aggressive defensive scoring
                        if (opponentCount === 3 && emptyCount === 1) {
                            score -= 5000; // Prioritize blocking 3-in-a-rows heavily
                        } else if (opponentCount === 2 && emptyCount === 2) {
                            score -= 50;   // Also prioritize blocking open 2-in-a-rows
                        }
                    }
                });
            }
        }
        return score;
    };
    
    const scorePositionStrategic = (currentBoard: BoardState, player: Player) => {
        let score = scorePositionTactical(currentBoard, player);
        for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) {
            if (currentBoard[r][c] === player) score += POSITIONAL_VALUE_MAP[r][c];
            else if (currentBoard[r][c] !== null) score -= POSITIONAL_VALUE_MAP[r][c];
        }}
        return score;
    };
    
    const minimax = (currentBoard: BoardState, currentMovesMade: number, depth: number, alpha: number, beta: number, maximizingPlayer: boolean, scoringFunction: (b: BoardState, p: Player) => number, moveList: Move[] | null = null): { score: number, move?: Move } => {
        const moves = moveList || getValidMoves(currentBoard, currentMovesMade);
        const isTerminal = checkWin(AI_PLAYER, currentBoard) || checkWin(HUMAN_PLAYER, currentBoard) || depth === 0 || moves.length === 0;

        if (isTerminal) {
            if (checkWin(AI_PLAYER, currentBoard)) return { score: 100000 + depth * 100 };
            if (checkWin(HUMAN_PLAYER, currentBoard)) return { score: -100000 - depth * 100 };
            return { score: scoringFunction(currentBoard, AI_PLAYER) };
        }

        let bestMove = moves[0];
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const newBoard = currentBoard.map(r => [...r]); newBoard[move.r][move.c] = AI_PLAYER;
                const { score } = minimax(newBoard, currentMovesMade + 1, depth - 1, alpha, beta, false, scoringFunction);
                if (score > maxEval) { maxEval = score; bestMove = move; }
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const newBoard = currentBoard.map(r => [...r]); newBoard[move.r][move.c] = HUMAN_PLAYER;
                const { score } = minimax(newBoard, currentMovesMade + 1, depth - 1, alpha, beta, true, scoringFunction);
                if (score < minEval) { minEval = score; bestMove = move; }
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return { score: minEval, move: bestMove };
        }
    };
    
    const getEasyMove = (moves: Move[], currentBoard: BoardState) => {
        for (const move of moves) {
            const tempBoard = currentBoard.map(r => [...r]); tempBoard[move.r][move.c] = AI_PLAYER;
            if (checkWin(AI_PLAYER, tempBoard)) return move;
        }
        for (const move of moves) {
            const tempBoard = currentBoard.map(r => [...r]); tempBoard[move.r][move.c] = HUMAN_PLAYER;
            if (checkWin(HUMAN_PLAYER, tempBoard)) return move;
        }
        return moves[Math.floor(Math.random() * moves.length)];
    };
    
    const getLearningMove = (player: Player, moves: Move[], currentBoard: BoardState, gameHistory: MoveHistoryItem[], currentMovesMade: number, memory: GameMemory, depth: number = 4) => {
        const opponent = player === PLAYER_X ? PLAYER_O : PLAYER_X;
        
        const immediateWinMove = moves.find(move => {
            const tempBoard = currentBoard.map(r => [...r]); tempBoard[move.r][move.c] = player;
            return checkWin(player, tempBoard);
        });
        if (immediateWinMove) return immediateWinMove;

        const immediateBlockMove = moves.find(move => {
            const tempBoard = currentBoard.map(r => [...r]); tempBoard[move.r][move.c] = opponent;
            return checkWin(opponent, tempBoard);
        });
        if (immediateBlockMove) return immediateBlockMove;

        const historyString = gameHistory.map(m => `${m.player}:${m.r},${m.c}`).join(';');
        const badMoves = new Set<string>();

        const gamesToCheck = player === AI_PLAYER ? memory.losses : memory.wins;

        for (const game of gamesToCheck) {
            if (game.moves.startsWith(historyString)) {
                const nextMoveStr = game.moves.substring(historyString.length ? historyString.length + 1 : 0).split(';')[0];
                if (nextMoveStr && nextMoveStr.startsWith(player + ':')) {
                    badMoves.add(nextMoveStr.substring(2));
                }
            }
        }

        const safeMoves = moves.filter(move => !badMoves.has(`${move.r},${move.c}`));
        if (safeMoves.length > 0) {
            const isMaximizing = player === AI_PLAYER;
            return minimax(currentBoard, currentMovesMade, depth, -Infinity, Infinity, isMaximizing, scorePositionStrategic, safeMoves).move;
        }
        
        return moves[Math.floor(Math.random() * moves.length)];
    };

    const computerMove = useCallback(() => {
        if (validMoves.length === 0) {
            setIsThinking(false);
            return;
        }

        let bestMove: Move | undefined;
        const difficultySettings = {
            [Difficulty.Medium]: { depth: 2, strategic: false },
            [Difficulty.Hard]: { depth: 3, strategic: true },
            [Difficulty.Expert]: { depth: movesMade > 20 ? 4 : 3, strategic: true },
        };

        if (difficulty === Difficulty.Easy) {
            bestMove = getEasyMove(validMoves, board);
        } else if (difficulty === Difficulty.Learning) {
            bestMove = getLearningMove(AI_PLAYER, validMoves, board, moveHistory, movesMade, gameMemory);
        } else {
            const setting = difficultySettings[difficulty];
            const scoringFunction = setting.strategic ? scorePositionStrategic : scorePositionTactical;
            bestMove = minimax(board, movesMade, setting.depth, -Infinity, Infinity, true, scoringFunction).move;
        }
        
        setTimeout(() => {
            if (bestMove) {
                makeMove(bestMove.r, bestMove.c);
            } else if (validMoves.length > 0) {
                makeMove(validMoves[0].r, validMoves[0].c);
            }
            setIsThinking(false);
        }, 100);
    }, [validMoves, difficulty, board, movesMade, makeMove, moveHistory, gameMemory]);
    
    useEffect(() => {
        if (!gameOver && gameMode === GameMode.PvC && currentPlayer === AI_PLAYER) {
            setIsThinking(true);
            const timer = setTimeout(computerMove, 500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameOver, gameMode, computerMove]);

    const gameStatus = useMemo(() => {
        if (isSimulatingRef.current) return simulationStatus;
        if (gameOver) {
            if (winInfo) {
                const winner = board[winInfo[0].r][winInfo[0].c];
                return `Player ${winner} Wins!`;
            }
            return "It's a Draw!";
        }
        if (isThinking) return "Professor Caz is thinking...";
        return `Player ${currentPlayer}'s Turn`;
    }, [gameOver, winInfo, board, currentPlayer, isThinking, simulationStatus]);
    
    // --- Simulation Logic ---
    const playSimulationGame = (memory: GameMemory): Promise<{ history: MoveHistoryItem[], winner: Player | null } | null> => {
        return new Promise(resolve => {
            let simBoard = createInitialBoard();
            let simCurrentPlayer = Math.random() < 0.5 ? PLAYER_X : PLAYER_O;
            let simMovesMade = 0;
            let simHistory: MoveHistoryItem[] = [];

            const gameLoop = () => {
                if (!isSimulatingRef.current) {
                    resolve(null);
                    return;
                }
                const validSimMoves = getValidMoves(simBoard, simMovesMade);
                if (validSimMoves.length === 0) {
                    resolve({ history: simHistory, winner: null });
                    return;
                }
                
                let move: Move | undefined = getLearningMove(simCurrentPlayer, validSimMoves, simBoard, simHistory, simMovesMade, memory, 4);

                if (!move) move = validSimMoves[Math.floor(Math.random() * validSimMoves.length)];

                simBoard[move.r][move.c] = simCurrentPlayer;
                simMovesMade++;
                simHistory.push({ player: simCurrentPlayer, r: move.r, c: move.c });

                const winner = checkWin(simCurrentPlayer, simBoard);
                if (winner) {
                    resolve({ history: simHistory, winner: simCurrentPlayer });
                    return;
                }

                simCurrentPlayer = (simCurrentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
                
                setTimeout(gameLoop, 0);
            };
            gameLoop();
        });
    };
    
    const startSimulation = async (gamesToPlay: number) => {
        isSimulatingRef.current = true;
        // Force a re-render to update UI
        setSimulationStatus('Starting simulation...');

        let currentMemory: GameMemory = JSON.parse(JSON.stringify(gameMemory));

        for (let i = 1; i <= gamesToPlay; i++) {
            if (!isSimulatingRef.current) break;
            setSimulationStatus(`Simulating Game ${i} of ${gamesToPlay}...`);
            
            const gameResult = await playSimulationGame(currentMemory);

            if (gameResult) {
                const { history, winner } = gameResult;
                const moveString = history.map(m => `${m.player}:${m.r},${m.c}`).join(';');
                
                if (winner === AI_PLAYER) {
                    if (!currentMemory.wins.some(w => w.moves === moveString)) {
                        currentMemory.wins.push({ moves: moveString });
                    }
                } else if (winner === HUMAN_PLAYER) {
                    if (!currentMemory.losses.some(l => l.moves === moveString)) {
                        currentMemory.losses.push({ moves: moveString });
                    }
                }
            }
        }

        setGameMemory(currentMemory);
        try {
            localStorage.setItem('cazConnectMemory', JSON.stringify(currentMemory));
        } catch (error) {
            console.error("Failed to save AI memory to localStorage", error);
        }

        isSimulatingRef.current = false;
        setSimulationStatus('');
        alert(`AI training complete! Memory now has ${currentMemory.wins.length} winning paths and ${currentMemory.losses.length} losing paths.`);
        resetGame();
    };

    const stopSimulation = () => {
        isSimulatingRef.current = false;
    };

    const exportMemory = () => {
        const memoryString = JSON.stringify(gameMemory, null, 2);
        const blob = new Blob([memoryString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'caz-connect-ai-memory.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importMemory = (file: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedMemory = JSON.parse(e.target?.result as string);
                if (importedMemory && Array.isArray(importedMemory.wins) && Array.isArray(importedMemory.losses)) {
                    setGameMemory(importedMemory);
                    localStorage.setItem('cazConnectMemory', JSON.stringify(importedMemory));
                    alert(`AI Memory imported successfully!\nWins: ${importedMemory.wins.length}\nLosses: ${importedMemory.losses.length}`);
                } else {
                    alert('Invalid memory file format.');
                }
            } catch (error) {
                alert('Error reading or parsing the memory file.');
            }
        };
        reader.readAsText(file);
    };

    return {
        board,
        gameStatus,
        scores,
        validMoves,
        lastMove,
        winInfo,
        isThinking,
        isSimulating: isSimulatingRef.current,
        gameMode,
        difficulty,
        isMuted,
        installPrompt: {
            visible: isInstallPromptVisible,
            trigger: triggerInstallPrompt,
            dismiss: () => setIsInstallPromptVisible(false)
        },
        actions: {
            handleCellClick,
            resetGame,
            setGameMode: (mode: GameMode) => setGameMode(mode),
            setDifficulty: (diff: Difficulty) => setDifficulty(diff),
            startSimulation,
            stopSimulation,
            importMemory,
            exportMemory,
            toggleMute,
        },
    };
};
