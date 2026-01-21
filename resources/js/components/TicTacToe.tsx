import React, { useState, useEffect } from 'react';
import { X, Circle, RotateCcw, Trophy, Medal } from 'lucide-react';
import { Button } from './ui/button';

export default function TicTacToe({ leaderboard = [] }: { leaderboard?: any[] }) {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerNext, setIsPlayerNext] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [winningLine, setWinningLine] = useState<number[] | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    const checkResult = (squares: any[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        if (!squares.includes(null)) return { winner: 'Draw', line: null };
        return null;
    };

    const saveScore = (win: boolean) => {
        if (!win) return;
        fetch('/student/game-scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({ game_type: 'tictactoe', score: 1 }), // 1 point for a win
        }).catch(err => console.error('Failed to save score:', err));
    };

    useEffect(() => {
        if (winner === 'X') {
            saveScore(true);
        }
    }, [winner]);

    // Minimax Algorithm
    const minimax = (squares: any[], depth: number, isMaximizing: boolean): number => {
        const result = checkResult(squares);
        if (result) {
            if (result.winner === 'O') return 10 - depth;
            if (result.winner === 'X') return depth - 10;
            return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = 'O';
                    let score = minimax(squares, depth + 1, false);
                    squares[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = 'X';
                    let score = minimax(squares, depth + 1, true);
                    squares[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const findBestMove = (currentBoard: any[]) => {
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                currentBoard[i] = 'O';
                let score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    };

    const handleClick = (i: number) => {
        if (winner || board[i] || !isPlayerNext || isThinking) return;

        const newBoard = board.slice();
        newBoard[i] = 'X';
        setBoard(newBoard);
        setIsPlayerNext(false);

        const result = checkResult(newBoard);
        if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
        } else {
            // System's turn
            setIsThinking(true);
            setTimeout(() => {
                const bestMove = findBestMove(newBoard.slice());
                if (bestMove !== -1) {
                    newBoard[bestMove] = 'O';
                    setBoard(newBoard);

                    const finalResult = checkResult(newBoard);
                    if (finalResult) {
                        setWinner(finalResult.winner);
                        setWinningLine(finalResult.line);
                    }
                }
                setIsPlayerNext(true);
                setIsThinking(false);
            }, 600);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsPlayerNext(true);
        setWinner(null);
        setWinningLine(null);
        setIsThinking(false);
    };

    const renderSquare = (i: number) => {
        const isWinningSquare = winningLine?.includes(i);
        return (
            <button
                className={`w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg transition-all duration-200 border-2 
                    ${!board[i] && isPlayerNext && !winner && !isThinking ? 'hover:bg-primary/5 cursor-pointer border-muted' : 'cursor-default border-transparent'}
                    ${isWinningSquare ? 'bg-primary/10 border-primary text-primary scale-105' : 'bg-card'}
                    ${board[i] === 'X' ? 'text-blue-600' : 'text-rose-600'}`}
                onClick={() => handleClick(i)}
            >
                {board[i] === 'X' && <X className="w-10 h-10 animate-in zoom-in-50 duration-300" />}
                {board[i] === 'O' && <Circle className="w-10 h-10 animate-in zoom-in-50 duration-300" />}
            </button>
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-1 w-full max-w-[650px]">
            {/* Game Area */}
            <div className="flex flex-col items-center gap-3 flex-grow">
                <div className="flex flex-col items-center gap-1 min-h-[50px]">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {winner ? 'Match Ended' : (isThinking ? 'System thinking...' : (isPlayerNext ? 'Your Turn (X)' : 'System Turn (O)'))}
                    </h3>
                    {winner && (
                        <p className={`text-base font-black uppercase tracking-tighter animate-in zoom-in-50 duration-300 ${winner === 'X' ? 'text-indigo-600' : winner === 'O' ? 'text-rose-600' : 'text-amber-600'}`}>
                            {winner === 'X' ? 'Victory!' : winner === 'O' ? 'Defeated' : "It's a Draw"}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded-xl border-2 border-muted shadow-inner w-[180px] h-[180px]">
                    {board.map((_, i) => (
                        <React.Fragment key={i}>{renderSquare(i)}</React.Fragment>
                    ))}
                </div>

                <Button
                    onClick={resetGame}
                    variant="outline"
                    size="sm"
                    className="gap-2 group transition-all active:scale-95 h-8 text-[10px] rounded-full px-4 mt-2"
                    disabled={isThinking}
                >
                    <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    New Game
                </Button>
            </div>

            {/* Sidebar Leaderboard */}
            <div className="w-full md:w-[150px] flex flex-col space-y-3 bg-muted/10 p-3 rounded-xl border border-dashed border-muted-foreground/20">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5 border-b border-muted-foreground/10 pb-2">
                    <Medal className="w-3 h-3 text-amber-500/70" /> Hall of Fame
                </h4>
                <div className="space-y-3">
                    {leaderboard.length > 0 ? leaderboard.slice(0, 3).map((entry, index) => (
                        <div key={index} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold truncate max-w-[80px] text-foreground/80">{entry.user.name}</span>
                                <span className="font-mono font-black text-indigo-600/80">{entry.score}W</span>
                            </div>
                            <div className="w-full bg-muted/50 h-1 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : 'bg-orange-400/80'}`}
                                    style={{ width: `${(entry.score / (leaderboard[0].score || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    )) : (
                        <div className="py-8 text-center text-[9px] text-muted-foreground/40 italic">
                            No wins yet
                        </div>
                    )}
                </div>
                <div className="mt-auto hidden md:block pt-3 border-t border-dashed border-muted-foreground/10">
                    <p className="text-[8px] text-muted-foreground/60 leading-tight italic">
                        Beat the AI to earn your spot!
                    </p>
                </div>
            </div>
        </div>
    );
}
