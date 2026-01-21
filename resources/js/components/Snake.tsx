import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Medal } from 'lucide-react';

const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }];
const INITIAL_DIRECTION = 'UP';
const SPEED = 150;

export default function Snake({ leaderboard = [] }: { leaderboard?: any[] }) {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 3, y: 3 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    const generateFood = useCallback(() => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            // Check if food on snake
            const onSnake = snake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y);
            if (!onSnake) break;
        }
        return newFood;
    }, [snake]);

    const moveSnake = useCallback(() => {
        if (gameOver || !gameStarted) return;

        setSnake(prevSnake => {
            const head = { ...prevSnake[0] };

            switch (direction) {
                case 'UP': head.y -= 1; break;
                case 'DOWN': head.y += 1; break;
                case 'LEFT': head.x -= 1; break;
                case 'RIGHT': head.x += 1; break;
            }

            // Check collisions (walls)
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                setGameOver(true);
                return prevSnake;
            }

            // Check collisions (self)
            if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setGameOver(true);
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // Check food
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                setFood(generateFood());
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food, gameOver, generateFood]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameStarted && !gameOver && (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key))) {
                setGameStarted(true);
            }
            switch (e.key) {
                case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
                case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
                case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
                case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction]);

    const saveScore = useCallback((finalScore: number) => {
        if (finalScore <= 0) return;
        fetch('/student/game-scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({ game_type: 'snake', score: finalScore }),
        }).catch(err => console.error('Failed to save score:', err));
    }, []);

    useEffect(() => {
        if (!gameOver && gameStarted) {
            gameLoopRef.current = setInterval(moveSnake, SPEED);
        } else {
            if (gameOver && score > highScore) {
                setHighScore(score);
                saveScore(score);
            }
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [moveSnake, gameOver, gameStarted, score, highScore, saveScore]);

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setFood({ x: 3, y: 3 });
        setDirection(INITIAL_DIRECTION);
        setGameOver(false);
        setGameStarted(false);
        setScore(0);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 p-1 w-full max-w-[650px]">
            {/* Game Area */}
            <div className="flex flex-col items-center gap-2 flex-grow">
                <div className="flex justify-between w-full px-2 text-[10px] font-black uppercase tracking-tighter text-muted-foreground/80 lowercase">
                    <span>Score: <span className="text-primary font-mono text-xs">{score}</span></span>
                    <span>Best: <span className="font-mono text-xs">{highScore}</span></span>
                </div>

                <div
                    className="relative bg-muted/20 border-2 rounded-lg overflow-hidden shadow-inner group transition-all duration-300"
                    style={{
                        width: '240px',
                        height: '240px',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                    }}
                >
                    {food && (
                        <div
                            className="bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                            style={{ gridColumnStart: food.x + 1, gridRowStart: food.y + 1 }}
                        />
                    )}

                    {snake.map((segment, i) => (
                        <div
                            key={i}
                            className={`${i === 0 ? 'bg-indigo-600 rounded-sm z-10 shadow-sm' : 'bg-indigo-400/80'} transition-all duration-75`}
                            style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }}
                        />
                    ))}

                    {!gameStarted && !gameOver && (
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center p-4">
                            <Button onClick={() => setGameStarted(true)} size="lg" className="rounded-full h-16 w-16 flex flex-col gap-0 shadow-2xl animate-in zoom-in-50">
                                <ArrowUp className="w-6 h-6" />
                                <span className="text-[8px] font-black tracking-widest">START</span>
                            </Button>
                        </div>
                    )}

                    {gameOver && (
                        <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-300">
                            <Trophy className="w-8 h-8 text-amber-500 mb-1" />
                            <h3 className="text-lg font-black text-foreground">GAME OVER</h3>
                            <p className="text-[10px] text-muted-foreground mb-3">Score: {score}</p>
                            <Button onClick={resetGame} size="sm" className="gap-2 rounded-full h-8 px-4 text-[10px]">
                                <RotateCcw className="w-3 h-3" /> Try Again
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-1 scale-75 opacity-60">
                    <div />
                    <Button variant="outline" size="icon" onClick={() => direction !== 'DOWN' && setDirection('UP')} className="h-7 w-7"><ArrowUp className="h-3 w-3" /></Button>
                    <div />
                    <Button variant="outline" size="icon" onClick={() => direction !== 'RIGHT' && setDirection('LEFT')} className="h-7 w-7"><ArrowLeft className="h-3 w-3" /></Button>
                    <Button variant="outline" size="icon" onClick={() => direction !== 'UP' && setDirection('DOWN')} className="h-7 w-7"><ArrowDown className="h-3 w-3" /></Button>
                    <Button variant="outline" size="icon" onClick={() => direction !== 'LEFT' && setDirection('RIGHT')} className="h-7 w-7"><ArrowRight className="h-3 w-3" /></Button>
                </div>
            </div>

            {/* Sidebar Leaderboard */}
            <div className="w-full md:w-[150px] flex flex-col space-y-3 bg-muted/10 p-3 rounded-xl border border-dashed border-muted-foreground/20">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5 border-b border-muted-foreground/10 pb-2">
                    <Medal className="w-3 h-3 text-amber-500/70" /> Top Ranked
                </h4>
                <div className="space-y-2.5">
                    {leaderboard.length > 0 ? leaderboard.slice(0, 3).map((entry, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold truncate max-w-[80px] text-foreground/80">{entry.user.name}</span>
                                <span className="font-mono font-black text-indigo-600/80">{entry.score}</span>
                            </div>
                            <div className="w-full bg-muted/50 h-1 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : 'bg-orange-400/80'}`}
                                    style={{ width: `${(entry.score / (leaderboard[0].score || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    )) : (
                        <div className="py-8 text-center">
                            <p className="text-[9px] text-muted-foreground italic opacity-40">No scores</p>
                        </div>
                    )}
                </div>
                <div className="mt-auto hidden md:block pt-3 border-t border-dashed border-muted-foreground/10">
                    <p className="text-[8px] text-muted-foreground/60 leading-tight">
                        Arrow keys or buttons to navigate.
                    </p>
                </div>
            </div>
        </div>
    );
}
