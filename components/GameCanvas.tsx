
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Click, Position, ScorePopup } from '../types';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
}

const IMAGE_SIZE = { width: 150, height: 225 };

const ScorePopupItem: React.FC<{ popup: ScorePopup }> = ({ popup }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`absolute text-2xl font-extrabold text-indigo-600 transition-all duration-1000 pointer-events-none ${visible ? 'opacity-100 -translate-y-16' : 'opacity-0 -translate-y-8'}`}
            style={{ left: popup.position.x, top: popup.position.y }}
        >
            +{popup.score}
        </div>
    )
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate }) => {
  const [imagePosition, setImagePosition] = useState<Position | null>(null);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const startNewGame = useCallback(() => {
    if (canvasRef.current) {
      const { width, height } = canvasRef.current.getBoundingClientRect();
      const newX = Math.random() * (width - IMAGE_SIZE.width);
      const newY = Math.random() * (height - IMAGE_SIZE.height);
      setImagePosition({ x: newX, y: newY });
      setClicks([]);
      setScorePopups([]);
    }
  }, []);

  useEffect(() => {
    startNewGame();
    window.addEventListener('resize', startNewGame);
    return () => window.removeEventListener('resize', startNewGame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !imagePosition) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const newClick = { id: Date.now(), x: clickX, y: clickY };
    setClicks(prevClicks => [...prevClicks, newClick]);

    const isDirectHit =
      clickX >= imagePosition.x &&
      clickX <= imagePosition.x + IMAGE_SIZE.width &&
      clickY >= imagePosition.y &&
      clickY <= imagePosition.y + IMAGE_SIZE.height;

    let score = 0;
    if (isDirectHit) {
      score = 10;
    } else {
      const imageCenterX = imagePosition.x + IMAGE_SIZE.width / 2;
      const imageCenterY = imagePosition.y + IMAGE_SIZE.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(clickX - imageCenterX, 2) + Math.pow(clickY - imageCenterY, 2)
      );

      const maxDistance = Math.max(IMAGE_SIZE.width, IMAGE_SIZE.height) * 1.5;
      if (distance < maxDistance) {
        score = Math.floor(8 * (1 - distance / maxDistance));
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
      className="w-full h-full relative cursor-crosshair overflow-hidden bg-slate-200"
      onClick={handleCanvasClick}
    >
        {!imagePosition && <div className="absolute inset-0 flex items-center justify-center text-slate-500">Loading game...</div>}
      
      {imagePosition && (
        <img
          src={`https://picsum.photos/${IMAGE_SIZE.width}/${IMAGE_SIZE.height}?random=${Math.random()}`}
          alt="Target"
          className="absolute rounded-lg shadow-xl select-none transition-all duration-500 ease-out animate-fade-in"
          style={{
            width: `${IMAGE_SIZE.width}px`,
            height: `${IMAGE_SIZE.height}px`,
            top: `${imagePosition.y}px`,
            left: `${imagePosition.x}px`,
          }}
          draggable="false"
        />
      )}

      {clicks.map(click => (
        <div
          key={click.id}
          className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 animate-pop-in"
          style={{ left: `${click.x}px`, top: `${click.y}px` }}
        />
      ))}

      {scorePopups.map(popup => (
         <ScorePopupItem key={popup.id} popup={popup} />
      ))}

      <style>{`
        @keyframes pop-in {
            0% { transform: scale(0) translate(-50%, -50%); opacity: 0; }
            50% { transform: scale(1.2) translate(-50%, -50%); opacity: 1; }
            100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
        }
        .animate-pop-in {
            animation: pop-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};

export default GameCanvas;
