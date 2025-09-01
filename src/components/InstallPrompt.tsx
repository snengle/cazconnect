
import React from 'react';

interface InstallPromptProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#16213e] shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-50 transform translate-y-0 transition-transform duration-300 ease-in-out">
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex-grow">
                    <h3 className="m-0 mb-1 text-lg font-semibold text-white">Install Caz Connect</h3>
                    <p className="m-0 text-sm leading-snug">Add to your Home Screen for a full-screen, offline experience!</p>
                </div>
                <div className="flex gap-2.5 flex-shrink-0">
                    <button onClick={onInstall} className="py-2 px-4 font-semibold rounded-lg bg-[#49e8b2] text-[#1a1a2e]">Install</button>
                    <button onClick={onDismiss} className="py-2 px-4 font-semibold rounded-lg bg-[#0f3460]">Later</button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
