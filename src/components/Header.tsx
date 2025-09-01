
import React from 'react';

const VolumeOnIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 4.06c0-1.34-1.61-2.25-2.83-1.46L5.43 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2.43l5.24 3.4c1.22.79 2.83-.12 2.83-1.46V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM20 12c0 2.76-1.74 5.09-4.01 6.04v-12c2.27.95 4.01 3.27 4.01 5.96z"></path></svg>
);

const VolumeOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3.73L12 18.27v-5.52l4.51 4.51c-.67.43-1.4.76-2.18.98v2.06a8.99 8.99 0 0 0 3.65-1.49L19.73 21 21 19.73l-9-9L4.27 3zM12 4.06L7.22 7.54 12 12.31V4.06z"></path></svg>
);

const Mascot: React.FC<{ isThinking: boolean }> = ({ isThinking }) => (
    <img
        src="/professor-caz.png"
        alt="Professor Caz Mascot"
        className={`h-[90px] w-[90px] lg:h-[110px] lg:w-[110px] rounded-2xl shadow-lg flex-shrink-0 transition-opacity duration-500 ${isThinking ? 'animate-pulse' : ''}`}
    />
);

interface HeaderProps {
    isThinking: boolean;
    className?: string;
    isMuted: boolean;
    onToggleMute: () => void;
}

const Header: React.FC<HeaderProps> = ({ isThinking, className, isMuted, onToggleMute }) => {
    return (
        <header className={`title-container order-1 flex flex-col sm:flex-row items-center justify-between gap-4 w-full mt-2.5 relative lg:justify-start ${className || ''}`}>
            <div className="title-left flex flex-col sm:flex-row items-center gap-4 min-w-0">
                <Mascot isThinking={isThinking} />
                <div className="title-text-group text-center sm:text-left">
                    <h1 className="text-[#e94560] font-bold text-4xl lg:text-5xl m-0">Caz Connect</h1>
                    <h2 className="font-normal text-lg lg:text-xl m-0 -mt-1">A Game of Gravity & Connection</h2>
                </div>
            </div>
            <button 
                onClick={onToggleMute} 
                aria-label="Mute sound"
                className="w-11 h-11 p-2 rounded-full bg-[#0f3460] border-2 border-[#16213e] text-[#dcdcdc] cursor-pointer flex-shrink-0 absolute top-0 right-0 sm:static hover:bg-[rgba(73,232,178,0.4)]"
            >
                {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
            </button>
        </header>
    );
};

export default Header;
