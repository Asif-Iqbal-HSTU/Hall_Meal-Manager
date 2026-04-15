<!DOCTYPE html>
<html>
<head>
    <title>Meal Cards</title>
    <style>
        @page {
            margin: 10mm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 0;
        }
        .page {
            width: 100%;
            page-break-after: always;
        }
        .page:last-child {
            page-break-after: avoid;
        }
        .card-container {
            width: 100%;
            border-collapse: collapse;
        }
        .card-td {
            width: 50%;
            padding: 5mm;
            vertical-align: top;
        }
        .card {
            border: 1pt solid #333;
            /* Remove fixed height to eliminate extra white space */
            min-height: 50mm; 
            padding: 3mm;
            position: relative;
            background-color: #fff;
            box-sizing: border-box;
        }
        .card-header {
            border-bottom: 0.5pt solid #444;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
        }
        .logo {
            float: left;
            width: 12mm;
            height: 12mm;
            margin-right: 3mm;
        }
        .header-text {
            float: left;
            width: 60mm;
            text-align: center;
        }
        .hall-name {
            font-size: 11pt;
            font-weight: bold;
            display: block;
            margin-top: 1mm;
        }
        .card-title {
            font-size: 10pt;
            display: block;
            margin-top: 1mm;
        }
        .card-body {
            clear: both;
            font-size: 10pt;
            line-height: 1.6;
        }
        .row {
            margin-bottom: 1mm;
        }
        .label {
            font-weight: bold;
            width: 30%;
            display: inline-block;
        }
        .value {
            width: 65%;
            display: inline-block;
        }
        .uid-value {
            font-weight: bold;
            font-family: 'Courier', monospace;
        }
        .meat-pref-badge {
            font-weight: bold;
            text-transform: uppercase;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    @php
        $logoPath = public_path('images/logo/logo.png');
        $logoData = '';
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
        }
    @endphp

    @foreach($students->chunk(6) as $chunk)
        <div class="page">
            <table class="card-container">
                @foreach($chunk->chunk(2) as $row)
                    <tr>
                        @foreach($row as $student)
                            <td class="card-td">
                                <div class="card">
                                    <div class="card-header">
                                        @if($logoData)
                                            <img src="data:image/png;base64,{{ $logoData }}" class="logo">
                                        @endif
                                        <div class="header-text">
                                            <span class="hall-name">{{ $hall->name ?? 'Hall Name' }}</span>
                                            <span class="card-title">Meal Card</span>
                                        </div>
                                        <div class="clear"></div>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <span class="label">UID:</span>
                                            <span class="value uid-value">{{ $student->user->unique_id }}</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">Student ID:</span>
                                            <span class="value">{{ $student->student_id }}</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">Name:</span>
                                            <span class="value" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ $student->user->name }}</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">Dept, Batch:</span>
                                            <span class="value">{{ $student->department }}, {{ $student->batch }}</span>
                                        </div>
                                        <div class="row">
                                            <span class="label">Meat Pref:</span>
                                            <span class="value meat-pref-badge">{{ $student->meat_preference ?? 'None' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        @endforeach
                        @if($row->count() < 2)
                            <td class="card-td"></td>
                        @endif
                    </tr>
                @endforeach
            </table>
        </div>
    @endforeach
</body>
</html>
