<x-mail::message>
    # Student Registration Successful

    Hello {{ $user->name }},

    You have been successfully registered to the BAUST Hall Meal Management System.

    **Login Details:**
    - **URL:** {{ config('app.url') }}/login
    - **Email/Student ID:** {{ $user->student_id }} (or {{ $user->email }})
    - **Password:** {{ $password }}

    Please login and update your password from your profile settings if needed.

    <x-mail::button :url="config('app.url') . '/login'">
        Login Now
    </x-mail::button>

    Thanks,<br>
    {{ config('app.name') }}
</x-mail::message>