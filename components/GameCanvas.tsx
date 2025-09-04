import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Click, Position, ScorePopup } from '../types';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
}

const IMAGE_SIZE = { width: 150, height: 225 };
const IMAGE_URL = '/sundari.svg';
const GAME_DURATION = 5; // seconds

const animationStyles = `
  @keyframes pop-in {
      0% { transform: scale(0) translate(-50%, -50%); opacity: 0; }
      50% { transform: scale(1.2) translate(-50%, -50%); opacity: 1; }
      100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
  }
  .animate-pop-in {
      animation: pop-in 0.3s ease-out forwards;
  }
  @keyframes iris-in {
      from { clip-path: circle(150% at 50% 50%); }
      to { clip-path: circle(0% at 50% 50%); }
  }
  .animate-iris-in {
      animation: iris-in 1.2s ease-in-out forwards;
  }
`;

const ScorePopupItem: React.FC<{ popup: ScorePopup }> = ({ popup }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`absolute text-2xl font-extrabold text-indigo-500 transition-all duration-1000 pointer-events-none z-20 ${visible ? 'opacity-100 -translate-y-16' : 'opacity-0 -translate-y-8'}`}
            style={{ left: popup.position.x, top: popup.position.y }}
        >
            +{popup.score}
        </div>
    )
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate }) => {
  const [imagePosition, setImagePosition] = useState<Position | null>(null);
  const [click, setClick] = useState<Click | null>(null);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showShade, setShowShade] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const canvasRef = useRef<HTMLDivElement>(null);
  // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const startNewGame = useCallback(() => {
    if (canvasRef.current) {
      const { width, height } = canvasRef.current.getBoundingClientRect();
      const newX = Math.random() * (width - IMAGE_SIZE.width);
      const newY = Math.random() * (height - IMAGE_SIZE.height);
      setImagePosition({ x: newX, y: newY });

      setClick(null);
      setIsGameOver(false);
      setScorePopups([]);
      setTimeLeft(GAME_DURATION);
      clearTimer();
      
      setShowShade(true);
      setTimeout(() => {
        setShowShade(false);
      }, 1200);
    }
  }, [clearTimer]);

  useEffect(() => {
    startNewGame();
    window.addEventListener('resize', startNewGame);
    return () => {
        window.removeEventListener('resize', startNewGame);
        clearTimer();
    }
  }, [startNewGame, clearTimer]);

  useEffect(() => {
    if (!isGameOver && !showShade) {
      timerIdRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearTimer();
            setIsGameOver(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isGameOver, showShade, clearTimer]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameOver || showShade || !canvasRef.current || !imagePosition) return;

    setIsGameOver(true);
    clearTimer();

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const newClick = { id: Date.now(), x: clickX, y: clickY };
    setClick(newClick);

    const isDirectHit =
      clickX >= imagePosition.x &&
      clickX <= imagePosition.x + IMAGE_SIZE.width &&
      clickY >= imagePosition.y &&
      clickY <= imagePosition.y + IMAGE_SIZE.height;

    let score = 0;
    if (isDirectHit) {
      score = 10;
    } else {
      const foreheadCenterX = imagePosition.x + IMAGE_SIZE.width / 2;
      const foreheadCenterY = imagePosition.y + IMAGE_SIZE.height * 0.2;
      
      const distance = Math.sqrt(
        Math.pow(clickX - foreheadCenterX, 2) + Math.pow(clickY - foreheadCenterY, 2)
      );

      const maxDistance = IMAGE_SIZE.width * 0.75;
      if (distance < maxDistance) {
        score = Math.max(0, Math.floor(8 * (1 - distance / maxDistance)));
      }
    }
    
    if (score > 0) {
        onScoreUpdate(score);
        const newPopup = { id: Date.now(), score, position: { x: clickX, y: clickY }};
        setScorePopups(prev => [...prev, newPopup]);
        setTimeout(() => {
            setScorePopups(current => current.filter(p => p.id !== newPopup.id));
        }, 1200);
    }
  };
  
  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative cursor-crosshair overflow-hidden bg-black"
      onClick={handleCanvasClick}
    >
        {showShade && (
            <div className="absolute inset-0 bg-black animate-iris-in z-30 pointer-events-none"></div>
        )}
      
      {!showShade && !isGameOver && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg pointer-events-none z-20">
            <span className={`text-4xl font-mono font-bold transition-colors duration-300 ${timeLeft <= 2 ? 'text-red-500' : 'text-white'}`}>
                0:0{timeLeft}
            </span>
        </div>
      )}

      {imagePosition && (
        <img
          src={IMAGE_URL}
          alt="Hidden Target"
          className={`absolute rounded-lg shadow-xl select-none pointer-events-none transition-opacity duration-700 ease-in ${isGameOver ? 'opacity-100' : 'opacity-0'}`}
          style={{
            width: `${IMAGE_SIZE.width}px`,
            height: `${IMAGE_SIZE.height}px`,
            top: `${imagePosition.y}px`,
            left: `${imagePosition.x}px`,
          }}
          draggable="false"
        />
      )}

      {click && (
        <div
          key={click.id}
          className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 animate-pop-in z-10"
          style={{ left: `${click.x}px`, top: `${click.y}px` }}
        />
      )}

      {scorePopups.map(popup => (
         <ScorePopupItem key={popup.id} popup={popup} />
      ))}

      <style>{animationStyles}</style>
    </div>
  );
};

export default GameCanvas;