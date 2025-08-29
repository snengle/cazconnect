
import React from 'react';
import { Player } from '../types';

interface StatusProps {
    statusText: string;
    scores: { [key in Player]: number };
}

const Status: React.FC<StatusProps> = ({ statusText, scores }) => {
    return (
        <div className="order-2 w-full text-center my-4 lg:my-5">
            <p className="text-lg font-semibold m-0 mb-2.5 min-h-[28px]">{statusText}</p>
            <div className="flex justify-center gap-5 text-base">
                <span className="bg-[#0f3460] py-1 px-4 rounded-lg">Player X: {scores[Player.X]}</span>
                <span className="bg-[#0f3460] py-1 px-4 rounded-lg">Player O: {scores[Player.O]}</span>
            </div>
        </div>
    );
};

export default Status;
