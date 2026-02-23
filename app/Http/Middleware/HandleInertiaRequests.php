<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'isRamadan' => config('app.is_ramadan', false),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'hall_id' => $request->user()->hall_id,
                    'role' => $request->user()->role,
                    'user_type' => $request->user()->user_type,
                    'hall_name' => $request->user()->hall ? $request->user()->hall->name : null,
                    'student_id' => $request->user()->student ? $request->user()->student->student_id : null,
                    'department' => $request->user()->student ? $request->user()->student->department : ($request->user()->teacher ? $request->user()->teacher->department : null),
                    'batch' => $request->user()->student ? $request->user()->student->batch : null,
                    'room_number' => $request->user()->student ? $request->user()->student->room_number : null,
                    'designation' => $request->user()->teacher ? $request->user()->teacher->designation : ($request->user()->staff ? $request->user()->staff->designation : null),
                    'balance' => $request->user()->student ? $request->user()->student->balance : ($request->user()->teacher ? $request->user()->teacher->balance : ($request->user()->staff ? $request->user()->staff->balance : 0)),
                    'hall' => $request->user()->hall,
                ] : null,
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
