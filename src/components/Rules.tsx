
import React from 'react';

const Rules: React.FC = () => {
    return (
        <div className="text-center text-sm bg-[#16213e] p-4 rounded-xl w-11/12 lg:w-full box-border">
            <h2 className="text-lg font-semibold mt-0 mb-2">Instructions</h2>
                <h3><strong>Objective</strong></h3>
                {/* Fix: Replaced deprecated align="left" with tailwind class "text-left" */}
                <p className="text-left">First player to connect <strong>four</strong> pieces horizontally, vertically, or diagonally wins!</p>
                <h3><strong>Valid Move</strong></h3>
                {/* Fix: Replaced deprecated align="left" with tailwind class "text-left" */}
                <p className="text-left">Pieces must either be directly next to any of the walls or be connected in a straight line to other piece(s) to a wall. Easy difficulty shows you all valid moves.</p>
          </div>
    );
};

export default Rules;
