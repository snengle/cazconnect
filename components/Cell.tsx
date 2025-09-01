import React from 'react';
import type { CellState } from '../types';

interface CellProps {
    value: CellState;
    isLastMove: boolean;
    isValid: boolean;
    highlightValid: boolean;
    isWinningPiece: boolean;
    onClick: () => void;
    'data-row': number;
    'data-col': number;
}

const Cell: React.FC<CellProps> = ({ value, isLastMove, isValid, highlightValid, isWinningPiece, onClick, 'data-row': dataRow, 'data-col': dataCol }) => {
    const playerClasses = {
        X: 'text-[#f9ed69] text-shadow-[0_0_10px_#f9ed69]',
        O: 'text-[#49e8b2] text-shadow-[0_0_10px_#49e8b2]',
    };

    const baseClasses = "aspect-square text-[6vmin] md:text-[40px] bg-[#0f3460] rounded-[1.5vmin] lg:rounded-lg flex items-center justify-center font-bold transition-colors duration-200";
    
    const lastMoveShadow = 'shadow-[inset_0_0_8px_2px_rgba(255,255,255,0.6)]';

    const stateClasses = `
        ${value ? playerClasses[value] : ''}
        ${isLastMove && !isWinningPiece ? lastMoveShadow : ''}
        ${isValid ? 'hover:bg-[rgba(73,232,178,0.4)] cursor-pointer' : 'cursor-not-allowed'}
        ${highlightValid ? 'bg-[rgba(73,232,178,0.2)]' : ''}
    `;

    const animationClasses = [
        (isLastMove ? 'animate-pop-in' : ''),
        (isWinningPiece ? 'animate-win-pulse' : '')
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={`${baseClasses} ${stateClasses} ${animationClasses}`} 
            onClick={isValid ? onClick : undefined}
            data-row={dataRow}
            data-col={dataCol}
        >
            {value}
            <style>{`
                @keyframes pop-in { 
                    0% { transform: scale(0.5); opacity: 0; } 
                    100% { transform: scale(1); opacity: 1; } 
                }
                .animate-pop-in { animation: pop-in 0.3s ease-out; }

                @keyframes win-pulse {
                    0%, 100% { box-shadow: inset 0 0 8px 2px rgba(255, 255, 255, 0.5); }
                    50% { box-shadow: inset 0 0 16px 6px rgba(255, 255, 255, 0.8); }
                }
                .animate-win-pulse {
                    animation: win-pulse 1.2s ease-in-out infinite;
                    animation-delay: 0.25s; /* Start after line draws */
                }
            `}</style>
        </div>
    );
};

export default Cell;