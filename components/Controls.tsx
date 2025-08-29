
import React, { useState, useRef } from 'react';
import { GameMode, Difficulty } from '../types';

interface ControlsProps {
    gameMode: GameMode;
    setGameMode: (mode: GameMode) => void;
    difficulty: Difficulty;
    setDifficulty: (difficulty: Difficulty) => void;
    onReset: () => void;
    isSimulating: boolean;
    onStartSimulation: (games: number) => void;
    onStopSimulation: () => void;
    onImportMemory: (file: File) => void;
    onExportMemory: () => void;
}

const ControlButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`font-['Poppins'] py-2 px-3 border-none rounded-lg bg-[#0f3460] text-[#dcdcdc] text-base cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
        {children}
    </button>
);

const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, className, ...props }) => (
     <select className={`font-['Poppins'] py-2 px-3 border-none rounded-lg bg-[#0f3460] text-[#dcdcdc] text-base cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
        {children}
    </select>
);

const Controls: React.FC<ControlsProps> = ({
    gameMode, setGameMode, difficulty, setDifficulty, onReset, 
    isSimulating, onStartSimulation, onStopSimulation, onImportMemory, onExportMemory
}) => {
    const [simGames, setSimGames] = useState(100);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportMemory(file);
        }
        event.target.value = '';
    };

    const showAiControls = gameMode === GameMode.PvC && difficulty === Difficulty.Learning;

    return (
        <div className="flex flex-col items-stretch w-11/12 lg:w-full gap-2.5 bg-[#16213e] p-4 rounded-xl">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="game-mode">Mode:</label>
                <SelectInput id="game-mode" value={gameMode} onChange={(e) => setGameMode(e.target.value as GameMode)} disabled={isSimulating}>
                    <option value={GameMode.PvC}>Player vs. Computer</option>
                    <option value={GameMode.PvP}>Player vs. Player</option>
                </SelectInput>
            </div>
            {gameMode === GameMode.PvC && (
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="difficulty-level">Difficulty:</label>
                    <SelectInput id="difficulty-level" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} disabled={isSimulating}>
                        <option value={Difficulty.Easy}>Easy</option>
                        <option value={Difficulty.Medium}>Medium</option>
                        <option value={Difficulty.Hard}>Hard</option>
                        <option value={Difficulty.Expert}>Expert</option>
                        <option value={Difficulty.Learning}>Learning</option>
                    </SelectInput>
                </div>
            )}
            <ControlButton onClick={onReset} disabled={isSimulating} className="bg-[#e94560] text-[#1a1a2e] font-bold transition-transform duration-200 ease-in-out hover:scale-105 mt-1.5">
                New Game
            </ControlButton>

            {showAiControls && (
                <div className="flex flex-col gap-2.5 w-full mt-4 pt-4 border-t border-[#0f3460]">
                    <div className="flex items-center justify-between gap-2">
                        <label htmlFor="sim-games-input">Simulate Games:</label>
                        <input type="number" id="sim-games-input" value={simGames} onChange={(e) => setSimGames(parseInt(e.target.value, 10))} min="1" max="10000" disabled={isSimulating}
                            className="w-20 bg-[#1a1a2e] border border-[#0f3460] p-1.5 text-center rounded-lg"
                        />
                    </div>
                    {!isSimulating ? (
                        <ControlButton onClick={() => onStartSimulation(simGames)}>Start AI Training</ControlButton>
                    ) : (
                        <ControlButton onClick={onStopSimulation} className="bg-[#e94560] text-[#1a1a2e] font-bold">Stop Training</ControlButton>
                    )}
                    <div className="flex gap-2.5">
                        <ControlButton onClick={handleImportClick} disabled={isSimulating} className="bg-[#4a5568] hover:bg-[#718096] flex-grow">Import AI</ControlButton>
                        <ControlButton onClick={onExportMemory} disabled={isSimulating} className="bg-[#4a5568] hover:bg-[#718096] flex-grow">Export AI</ControlButton>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
            )}
        </div>
    );
};

export default Controls;
