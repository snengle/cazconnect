
import React, { useRef, useState, useEffect } from 'react';
import type { BoardState, Move, WinInfo } from '../types';
import Cell from './Cell';

interface BoardProps {
    board: BoardState;
    onCellClick: (r: number, c: number) => void;
    validMoves: Move[];
    lastMove: Move | null;
    winInfo: WinInfo;
    isThinking: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, validMoves, lastMove, winInfo, isThinking }) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const [lineStyle, setLineStyle] = useState<React.CSSProperties>({ display: 'none' });

    useEffect(() => {
        if (winInfo && boardRef.current) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const firstCell = boardRef.current.querySelector(`[data-row='${winInfo[0].r}'][data-col='${winInfo[0].c}']`);
            const lastCell = boardRef.current.querySelector(`[data-row='${winInfo[3].r}'][data-col='${winInfo[3].c}']`);

            if (firstCell && lastCell) {
                const startRect = firstCell.getBoundingClientRect();
                const endRect = lastCell.getBoundingClientRect();
                
                const startX = startRect.left + startRect.width / 2 - boardRect.left;
                const startY = startRect.top + startRect.height / 2 - boardRect.top;
                const endX = endRect.left + endRect.width / 2 - boardRect.left;
                const endY = endRect.top + endRect.height / 2 - boardRect.top;

                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const ang = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                
                setLineStyle({
                    width: `${len}px`,
                    left: `${startX}px`,
                    top: `${startY}px`,
                    transform: `rotate(${ang}deg)`,
                    display: 'block',
                });
            }
        } else {
            setLineStyle({ display: 'none' });
        }
    }, [winInfo]);

    const validMovesSet = new Set(validMoves.map(m => `${m.r}-${m.c}`));

    return (
        <div className="relative">
            <div 
                ref={boardRef}
                className={`grid grid-cols-8 grid-rows-8 gap-1 p-1 border-4 border-[#16213e] bg-black rounded-lg shadow-2xl transition-opacity duration-300
                lg:gap-[5px] lg:p-[5px]
                ${isThinking ? 'cursor-wait opacity-60' : ''}`}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => (
                        <Cell
                            key={`${r}-${c}`}
                            value={cell}
                            isLastMove={lastMove?.r === r && lastMove?.c === c}
                            isValid={!winInfo && validMovesSet.has(`${r}-${c}`)}
                            onClick={() => onCellClick(r, c)}
                            data-row={r}
                            data-col={c}
                        />
                    ))
                )}
            </div>
            <div 
                className="absolute bg-[#f7b733] h-[5px] rounded-full shadow-[0_0_15px_#f7b733] transform-origin-left transition-all duration-500"
                style={lineStyle}
            ></div>
        </div>
    );
};

export default Board;
