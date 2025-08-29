
import React from 'react';
import type { CellState } from '../types';

interface CellProps {
    value: CellState;
    isLastMove: boolean;
    isValid: boolean;
    onClick: () => void;
    'data-row': number;
    'data-col': number;
}

const Cell: React.FC<CellProps> = ({ value, isLastMove, isValid, onClick }) => {
    const playerClasses = {
        X: 'text-[#f9ed69] text-shadow-[0_0_10px_#f9ed69]',
        O: 'text-[#49e8b2] text-shadow-[0_0_10px_#49e8b2]',
    };

    const baseClasses = "w-[10.5vmin] h-[10.5vmin] text-[7vmin] lg:w-[60px] lg:h-[60px] lg:text-[40px] bg-[#0f3460] rounded-[1.5vmin] lg:rounded-lg flex items-center justify-center font-bold transition-colors duration-200";
    
    const stateClasses = `
        ${value ? playerClasses[value] : ''}
        ${isLastMove ? 'shadow-[inset_0_0_8px_2px_rgba(255,255,255,0.6)]' : ''}
        ${isValid ? 'hover:bg-[rgba(73,232,178,0.4)] cursor-pointer' : 'cursor-not-allowed'}
    `;

    const animationClass = value ? 'animate-pop-in' : '';

    return (
        <div className={`${baseClasses} ${stateClasses} ${animationClass}`} onClick={isValid ? onClick : undefined}>
            {value}
            <style>{`
                @keyframes pop-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .animate-pop-in { animation: pop-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default Cell;
