<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class StudentsExport implements FromCollection, WithHeadings, WithMapping, WithColumnFormatting
{
    protected $hallId;
    protected $search;

    public function __construct($hallId, $search = null)
    {
        $this->hallId = $hallId;
        $this->search = $search;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $query = Student::with('user')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->where('users.hall_id', $this->hallId)
            ->select('students.*');

        if ($this->search) {
            $query->where(function ($q) {
                $q->where('students.student_id', 'like', "%{$this->search}%")
                    ->orWhere('users.name', 'like', "%{$this->search}%")
                    ->orWhere('users.unique_id', 'like', "%{$this->search}%");
            });
        }

        return $query->orderBy('users.unique_id', 'asc')->get();
    }

    public function headings(): array
    {
        return [
            'Unique ID',
            'Student ID',
            'Name',
            'Department',
            'Batch',
            'Room Number',
            'Meat Preference',
            'Balance',
            'Status'
        ];
    }

    public function map($student): array
    {
        return [
            $student->user->unique_id,
            $student->student_id,
            $student->user->name,
            $student->department,
            $student->batch,
            $student->room_number,
            ucfirst($student->meat_preference),
            $student->balance,
            ucfirst($student->user->status)
        ];
    }

    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT,
        ];
    }
}
