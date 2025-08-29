
import React from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import Header from './components/Header';
import Status from './components/Status';
import Board from './components/Board';
import Controls from './components/Controls';
import Rules from './components/Rules';
import InstallPrompt from './components/InstallPrompt';

const App: React.FC = () => {
    const {
        board,
        gameStatus,
        scores,
        validMoves,
        lastMove,
        winInfo,
        isThinking,
        isSimulating,
        gameMode,
        difficulty,
        installPrompt,
        isMuted,
        actions
    } = useGameLogic();

    return (
        <div className="main-container mx-auto p-2.5 flex flex-col items-center gap-5 max-w-lg lg:max-w-6xl lg:grid lg:grid-cols-[minmax(350px,_1fr)_1.5fr] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'title_game'_'info_game'] lg:items-start lg:gap-10">
            
            <Header 
                isThinking={isThinking || isSimulating} 
                className="lg:[grid-area:title]"
                isMuted={isMuted}
                onToggleMute={actions.toggleMute}
            />

            <main className="game-area order-2 flex flex-col items-center w-full lg:min-w-[525px] lg:justify-center lg:[grid-area:game]">
                <Status statusText={gameStatus} scores={scores} />
                <Board 
                    board={board}
                    onCellClick={actions.handleCellClick}
                    validMoves={validMoves}
                    lastMove={lastMove}
                    winInfo={winInfo}
                    isThinking={isThinking || isSimulating}
                />
            </main>

            <aside className="info-area order-3 flex flex-col gap-5 w-full items-center lg:justify-start lg:[grid-area:info]">
                <Controls
                    gameMode={gameMode}
                    setGameMode={actions.setGameMode}
                    difficulty={difficulty}
                    setDifficulty={actions.setDifficulty}
                    onReset={actions.resetGame}
                    isSimulating={isSimulating}
                    onStartSimulation={actions.startSimulation}
                    onStopSimulation={actions.stopSimulation}
                    onImportMemory={actions.importMemory}
                    onExportMemory={actions.exportMemory}
                />
                <Rules />
            </aside>
            
            {installPrompt.visible && (
                <InstallPrompt 
                    onInstall={installPrompt.trigger}
                    onDismiss={installPrompt.dismiss}
                />
            )}
        </div>
    );
};

export default App;
