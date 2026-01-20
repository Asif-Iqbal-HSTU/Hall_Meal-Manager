import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import BulkImportModal from '@/components/bulk-import-modal';
import EditStudentModal from '@/components/edit-student-modal';
import DepositBalanceModal from '@/components/deposit-balance-modal';
import { Pencil, Search, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StudentList({ students, filters, halls, selectedHallId }: { students: any[], filters: any, halls?: any[], selectedHallId?: number }) {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const memberTypeTitle = type === 'student' ? 'Students' : type === 'staff' ? 'Teachers & Staff' : 'Members';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: memberTypeTitle,
            href: admin.students.index().url + (type ? `?type=${type}` : ''),
        },
    ];

    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(admin.students.index().url,
                    { search, type, hall_id: selectedHallId },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const handleEdit = (student: any) => {
        setSelectedStudent(student);
        setEditModalOpen(true);
    };

    const handleDeposit = (student: any) => {
        setSelectedStudent(student);
        setDepositModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student List" />
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold">Registered {memberTypeTitle}</h2>
                    <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={`Search ${memberTypeTitle.toLowerCase()}...`}
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {halls && halls.length > 0 && (
                                <select
                                    className="h-10 border rounded px-3 text-sm font-bold bg-background focus:ring-1 focus:ring-emerald-500 outline-none min-w-[150px]"
                                    value={selectedHallId}
                                    onChange={(e) => router.get(admin.students.index().url, { hall_id: e.target.value, type })}
                                >
                                    {halls.map((hall: any) => (
                                        <option key={hall.id} value={hall.id}>{hall.name}</option>
                                    ))}
                                </select>
                            )}
                            <BulkImportModal />
                            <Button asChild>
                                <Link href={admin.students.create().url}>Register New Member</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{memberTypeTitle} in Your Hall</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">ID / Ref</th>
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">Name</th>
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground text-center">Type</th>
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">Dept / Desig</th>
                                        {(!type || type === 'student') && (
                                            <>
                                                <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">Batch</th>
                                                <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">Room</th>
                                            </>
                                        )}
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">Balance</th>
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student: any) => (
                                        <tr key={student.id} className="border-b group hover:bg-muted/50 transition-colors">
                                            <td className="p-2 font-mono text-xs">{student.student_id}</td>
                                            <td className="p-2">
                                                <div className="font-medium whitespace-nowrap">{student.name}</div>
                                                <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{student.email}</div>
                                            </td>
                                            <td className="p-2 text-center">
                                                <span className="capitalize text-[10px] font-bold px-1.5 py-0.5 rounded border border-muted-foreground/30 text-muted-foreground">
                                                    {student.user_type}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <div className="text-xs">{student.department || '-'}</div>
                                                {student.designation && (
                                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                                                        {student.designation}
                                                    </div>
                                                )}
                                            </td>
                                            {(!type || type === 'student') && (
                                                <>
                                                    <td className="p-2">{student.batch || '-'}</td>
                                                    <td className="p-2 text-xs font-mono">{student.room_number || '-'}</td>
                                                </>
                                            )}
                                            <td className="p-2 font-bold whitespace-nowrap">
                                                <span className={student.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                                                    {student.balance} TK
                                                </span>
                                            </td>
                                            <td className="p-2 text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(student)}
                                                        title="Edit Details"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600"
                                                        onClick={() => handleDeposit(student)}
                                                        title="Deposit Balance"
                                                    >
                                                        <Wallet className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={(!type || type === 'student') ? 9 : 7} className="p-4 text-center text-muted-foreground">
                                                No {memberTypeTitle.toLowerCase()} found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <EditStudentModal
                student={selectedStudent}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
            />
            <DepositBalanceModal
                student={selectedStudent}
                open={depositModalOpen}
                onOpenChange={setDepositModalOpen}
            />
        </AppLayout>
    );
}
