<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: sans-serif;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .hall-name {
            font-size: 24px;
            font-weight: bold;
        }

        .date {
            font-size: 18px;
            color: #555;
        }

        .meal-section {
            margin-bottom: 40px;
        }

        .meal-title {
            font-size: 20px;
            font-weight: bold;
            border-bottom: 2px solid #333;
            padding-bottom: 5px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .summary-box {
            background: #f4f4f4;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        .teacher-staff {
            background-color: #fff9c4;
            font-weight: bold;
        }

        .footer {
            text-align: right;
            margin-top: 20px;
            font-size: 10px;
            color: #888;
        }

        .beef {
            color: #d32f2f;
        }

        .mutton {
            color: #f57c00;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="hall-name">{{ $hall->name }}</div>
        <div class="date">Meal List for Tomorrow: {{ $date }}</div>
    </div>

    @foreach($data as $mealType => $mealData)
        <div class="meal-section">
            <div class="meal-title">{{ $mealType }}</div>

            <div class="summary-box">
                <strong>Summary:</strong>
                Total Meals: {{ $mealData['total_count'] }} |
                <span class="beef">Beef: {{ $mealData['beef_count'] }}</span> |
                <span class="mutton">Mutton: {{ $mealData['mutton_count'] }}</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID/Ref</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Preference</th>
                        <th>Qty</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($mealData['bookings'] as $booking)
                        <tr class="{{ in_array($booking['user_type'], ['teacher', 'staff']) ? 'teacher-staff' : '' }}">
                            <td>{{ $booking['member_id'] }}</td>
                            <td>{{ $booking['name'] }}</td>
                            <td style="text-transform: capitalize;">{{ $booking['user_type'] }}</td>
                            <td style="text-transform: capitalize;">{{ $booking['meat_preference'] }}</td>
                            <td>{{ $booking['quantity'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endforeach

    <div class="footer">
        Generated on {{ now()->toDayDateTimeString() }}
    </div>
</body>

</html>