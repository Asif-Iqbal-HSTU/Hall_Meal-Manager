<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        \Illuminate\Support\Facades\Gate::define('access-admin', function ($user) {
            return in_array($user->role, ['super_admin', 'hall_admin']);
        });

        \Illuminate\Support\Facades\Gate::define('access-student', function ($user) {
            return $user->role === 'student';
        });

        \Illuminate\Support\Facades\Gate::define('access-teacher', function ($user) {
            return $user->role === 'teacher';
        });

        \Illuminate\Support\Facades\Gate::define('access-staff', function ($user) {
            return $user->role === 'staff';
        });
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
