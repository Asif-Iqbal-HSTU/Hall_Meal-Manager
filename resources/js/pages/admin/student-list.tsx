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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: admin.students.index().url,
    },
];

export default function StudentList({ students, filters }: { students: any[], filters: any }) {
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(admin.students.index().url, { search }, {
                    preserveState: true,
                    replace: true,
                });
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
                    <h2 className="text-2xl font-bold">Registered Students</h2>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search students..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <BulkImportModal />
                            <Button asChild>
                                <Link href={admin.students.create().url}>Register New Student</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Students in Your Hall</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">Student ID</th>
                                        <th className="h-10 px-2 text-left text-xs uppercase text-muted-foreground">Name</th>
                                        <th className="h-10 px-2 text-left">Dept</th>
                                        <th className="h-10 px-2 text-left">Batch</th>
                                        <th className="h-10 px-2 text-left">Room</th>
                                        <th className="h-10 px-2 text-left">Balance</th>
                                        <th className="h-10 px-2 text-left">Email</th>
                                        <th className="h-10 px-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student: any) => (
                                        <tr key={student.id} className="border-b group hover:bg-muted/50 transition-colors">
                                            <td className="p-2 font-mono text-xs">{student.student_id}</td>
                                            <td className="p-2">{student.name}</td>
                                            <td className="p-2">{student.department}</td>
                                            <td className="p-2">{student.batch}</td>
                                            <td className="p-2">{student.room_number}</td>
                                            <td className="p-2 font-bold whitespace-nowrap">
                                                <span className={student.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                                                    {student.balance} TK
                                                </span>
                                            </td>
                                            <td className="p-2 truncate max-w-[150px]">{student.email}</td>
                                            <td className="p-2">
                                                <div className="flex gap-1">
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
                                            <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                                No students found.
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
