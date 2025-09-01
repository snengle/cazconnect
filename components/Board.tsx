import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { BoardState, Move, WinInfo } from '../types';
import { Difficulty } from '../types';
import Cell from './Cell';

interface BoardProps {
    board: BoardState;
    onCellClick: (r: number, c: number) => void;
    validMoves: Move[];
    lastMove: Move | null;
    winInfo: WinInfo;
    isThinking: boolean;
    difficulty: Difficulty;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, validMoves, lastMove, winInfo, isThinking, difficulty }) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const [lineData, setLineData] = useState<{ x: number; y: number; width: number; rotation: number } | null>(null);
    const [isLineVisible, setIsLineVisible] = useState(false);

    const calculateAndSetLine = useCallback(() => {
        if (!winInfo || !boardRef.current) {
            setLineData(null);
            return false;
        }

        const boardRect = boardRef.current.getBoundingClientRect();
        const startCell = boardRef.current.querySelector<HTMLElement>(`[data-row='${winInfo[0].r}'][data-col='${winInfo[0].c}']`);
        const endCell = boardRef.current.querySelector<HTMLElement>(`[data-row='${winInfo[winInfo.length - 1].r}'][data-col='${winInfo[winInfo.length - 1].c}']`);

        if (!startCell || !endCell || startCell.offsetWidth === 0) {
            return false;
        }

        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        const x1 = startRect.left + startRect.width / 2 - boardRect.left;
        const y1 = startRect.top + startRect.height / 2 - boardRect.top;
        const x2 = endRect.left + endRect.width / 2 - boardRect.left;
        const y2 = endRect.top + endRect.height / 2 - boardRect.top;
        
        const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const rotation = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        setLineData({
            x: x1,
            y: y1,
            width: width,
            rotation: rotation,
        });
        return true;

    }, [winInfo]);

    useEffect(() => {
        if (winInfo) {
            let animationFrameId: number;
            const attemptToDraw = () => {
                if (!calculateAndSetLine()) {
                    animationFrameId = requestAnimationFrame(attemptToDraw);
                }
            };
            const timerId = setTimeout(attemptToDraw, 50);
            
            window.addEventListener('resize', calculateAndSetLine);
            
            return () => {
                clearTimeout(timerId);
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener('resize', calculateAndSetLine);
            };
        } else {
            setLineData(null);
            setIsLineVisible(false);
        }
    }, [winInfo, calculateAndSetLine]);

    useEffect(() => {
        if (lineData) {
            const animationTimer = setTimeout(() => {
                setIsLineVisible(true);
            }, 50);
            return () => clearTimeout(animationTimer);
        }
    }, [lineData]);

    const validMovesSet = new Set(validMoves.map(m => `${m.r}-${m.c}`));
    const showValidMovesHighlight = difficulty === Difficulty.Easy;
    
    const winPiecesSet = useMemo(() => {
        if (!winInfo) return new Set();
        return new Set(winInfo.map(m => `${m.r}-${m.c}`));
    }, [winInfo]);

    return (
        <div className="relative w-[90vmin] max-w-[525px] lg:w-[525px]" ref={boardRef}>
            <div 
                className={`grid grid-cols-8 grid-rows-8 gap-1 p-1 border-4 border-[#16213e] bg-black rounded-lg shadow-2xl transition-opacity duration-300
                lg:gap-[5px] lg:p-[5px]
                ${isThinking ? 'cursor-wait opacity-60' : ''}`}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const isCellValid = !winInfo && validMovesSet.has(`${r}-${c}`);
                        const isWinningPiece = winPiecesSet.has(`${r}-${c}`);
                        return (
                            <Cell
                                key={`${r}-${c}`}
                                value={cell}
                                isLastMove={lastMove?.r === r && lastMove?.c === c}
                                isValid={isCellValid}
                                highlightValid={showValidMovesHighlight && isCellValid}
                                isWinningPiece={isWinningPiece}
                                onClick={() => onCellClick(r, c)}
                                data-row={r}
                                data-col={c}
                            />
                        );
                    })
                )}
            </div>

            {lineData && (
                 <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <g transform={`translate(${lineData.x}, ${lineData.y}) rotate(${lineData.rotation})`}>
                        <rect
                            x="0"
                            y="-2.5"
                            width={isLineVisible ? lineData.width : 0}
                            height="5"
                            rx="2.5"
                            ry="2.5"
                            fill="#e94560"
                            filter="url(#glow)"
                            style={{
                                transition: 'width 0.25s ease-out',
                                transformOrigin: 'center',
                            }}
                        />
                    </g>
                </svg>
            )}
        </div>
    );
};

export default Board;