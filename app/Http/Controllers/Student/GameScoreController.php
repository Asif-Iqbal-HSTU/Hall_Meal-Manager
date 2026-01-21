<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\GameScore;
use Illuminate\Http\Request;

class GameScoreController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'game_type' => 'required|string|in:snake,tictactoe',
            'score' => 'required|integer',
        ]);

        GameScore::create([
            'user_id' => auth()->id(),
            'game_type' => $request->game_type,
            'score' => $request->score,
        ]);

        return response()->json(['message' => 'Score saved successfully!']);
    }

    public static function getLeaderboard($gameType)
    {
        $query = GameScore::with('user')
            ->where('game_type', $gameType)
            ->select('user_id', \Illuminate\Support\Facades\DB::raw($gameType === 'snake' ? 'MAX(score) as score' : 'SUM(score) as score'))
            ->groupBy('user_id')
            ->orderBy('score', 'desc')
            ->take(3);

        return $query->get();
    }
}
