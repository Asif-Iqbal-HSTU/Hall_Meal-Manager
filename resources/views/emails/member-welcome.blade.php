<x-mail::message>
    # Welcome to BAUST Hall Meal Management System

    Hello {{ $user->name }},

    Your account has been successfully created. You can now log in to the system using the following credentials:

    **Email/ID:** {{ $user->email ?? 'Your Member ID' }}
    **Password:** {{ $password }}

    <x-mail::button :url="config('app.url') . '/login'">
        Login to Dashboard
    </x-mail::button>

    If you did not expect this email, please contact the hall administration.

    Thanks,<br>
    {{ config('app.name') }}
</x-mail::message>