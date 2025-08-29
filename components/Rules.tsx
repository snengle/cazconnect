
import React from 'react';

const Rules: React.FC = () => {
    return (
        <div className="text-center text-sm bg-[#16213e] p-4 rounded-xl w-11/12 lg:w-full box-border">
            <h3 className="text-lg font-semibold mt-0 mb-2">Rules</h3>
            <ol className="list-decimal list-inside text-left space-y-2">
                <li>The <strong>first move</strong> must be on an outer wall.</li>
                <li>A subsequent move is valid if it is either:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>(A) On any empty square on the <strong>outer wall</strong>.</li>
                        <li>(B) Touching a piece that has a solid, straight line of pieces back to a wall.</li>
                    </ul>
                </li>
                 <li>First player to connect <strong>four</strong> pieces horizontally, vertically, or diagonally wins!</li>
            </ol>
        </div>
    );
};

export default Rules;
