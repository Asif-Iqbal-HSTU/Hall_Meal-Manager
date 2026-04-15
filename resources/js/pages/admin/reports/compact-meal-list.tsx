import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft, ChevronRight, Search, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function CompactMealList({ 
    students, 
    bookingData, 
    selectedMonth, 
    selectedYear, 
    daysInMonth,
    months,
    years
}: { 
    students: any[], 
    bookingData: Record<number, Record<number, Record<string, number>>>,
    selectedMonth: number,
    selectedYear: number,
    daysInMonth: number,
    months: { value: number, label: string }[],
    years: number[]
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '#' },
        { title: 'Compact Meal List', href: '/admin/reports/compact-meal-list' },
    ];

    const [month, setMonth] = useState(selectedMonth);
    const [year, setYear] = useState(selectedYear);

    const handleFilter = () => {
        router.get('/admin/reports/compact-meal-list', { month, year }, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const getMonthName = (m: number) => months.find(mObj => mObj.value === m)?.label || '';

    const exportToExcel = () => {
        const table = document.getElementById('compact-meal-table');
        if (!table) return;
        const wb = XLSX.utils.table_to_book(table, { sheet: "Meal Report" });
        XLSX.writeFile(wb, `Compact_Meal_List_${getMonthName(month)}_${year}.xlsx`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Compact Meal List - ${getMonthName(month)} ${year}`} />
            
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <h2 className="text-2xl font-bold">Compact Meal List</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <select 
                            className="h-10 border rounded px-3 text-sm"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        <select 
                            className="h-10 border rounded px-3 text-sm"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <Button onClick={handleFilter} className="flex items-center gap-2">
                            <Search className="h-4 w-4" /> Filter
                        </Button>
                        <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                            <FileSpreadsheet className="h-4 w-4" /> Excel
                        </Button>
                        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                            <Printer className="h-4 w-4" /> Print
                        </Button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        @page { 
                            size: landscape; 
                            margin: 5mm; 
                        }
                        .print-hidden { display: none !important; }
                        body { background: white; }
                        .p-6 { padding: 0 !important; }
                        .compact-table { font-size: 8px !important; width: 100% !important; }
                        .compact-table th, .compact-table td { padding: 1px !important; }
                        .compact-table th { background-color: #f0f0f0 !important; border: 1px solid #000 !important; }
                        .compact-table td { border: 1px solid #000 !important; }
                        .card { border: none !important; box-shadow: none !important; }
                    }
                    .compact-table-container {
                        overflow-x: auto;
                        max-width: 100%;
                        max-height: 80vh;
                    }
                    .compact-table {
                        border-collapse: collapse;
                        font-size: 11px;
                        width: max-content;
                    }
                    .compact-table th, .compact-table td {
                        border: 1px solid #ccc;
                        text-align: center;
                        padding: 3px 2px;
                        position: relative;
                    }
                    .sticky-col {
                        position: sticky;
                        left: 0;
                        background-color: white;
                        z-index: 10;
                    }
                    .sticky-col-roll { left: 40px; }
                    .sticky-col-name { left: 100px; width: 120px; text-align: left !important; }
                    .meal-col { width: 15px; }
                    .meal-cell-p { background-color: #e6f3ff; font-weight: bold; }
                `}} />

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">
                            {getMonthName(month)} {year} - Compact Meal Taken List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="compact-table-container">
                            <table id="compact-meal-table" className="compact-table">
                                <thead>
                                    <tr>
                                        <th rowSpan={2} className="sticky-col">Room</th>
                                        <th rowSpan={2} className="sticky-col sticky-col-roll">Roll</th>
                                        <th rowSpan={2} className="sticky-col sticky-col-name">Name</th>
                                        <th rowSpan={2}>Dept.</th>
                                        <th rowSpan={2}>Batch</th>
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                            <th key={day} colSpan={3}>{day}</th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {Array.from({ length: daysInMonth }).map((_, i) => (
                                            <React.Fragment key={i}>
                                                <th className="meal-col">B</th>
                                                <th className="meal-col">L</th>
                                                <th className="meal-col">D</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="sticky-col">{student.room_number}</td>
                                            <td className="sticky-col sticky-col-roll" data-t="s" data-v={student.student_id}>{student.student_id}</td>
                                            <td className="sticky-col sticky-col-name truncate whitespace-nowrap">{student.name}</td>
                                            <td>{student.department}</td>
                                            <td>{student.batch}</td>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                                const dayData = bookingData[student.user_id]?.[day] || {};
                                                return (
                                                    <React.Fragment key={day}>
                                                        <td className={dayData.breakfast ? 'meal-cell-p' : ''}>{dayData.breakfast || ''}</td>
                                                        <td className={dayData.lunch ? 'meal-cell-p' : ''}>{dayData.lunch || ''}</td>
                                                        <td className={dayData.dinner ? 'meal-cell-p' : ''}>{dayData.dinner || ''}</td>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

// Internal import for React.Fragment if not used globaly.
import React from 'react';
