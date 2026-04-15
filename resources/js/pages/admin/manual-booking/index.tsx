import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Coffee,
    GraduationCap,
    Info,
    Loader2,
    Moon,
    Search,
    UserCheck,
    Users,
    UserX,
    Utensils,
    ShieldAlert,
} from 'lucide-react';
import BookingCalendar from '@/components/BookingCalendar';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: admin.dashboard().url,
    },
    {
        title: 'Manual Booking',
        href: '/admin/manual-booking',
    },
];

type BookingTab = 'student' | 'teacher' | 'staff';

export default function ManualBooking({
    teachers = [],
    staff = [],
}: {
    teachers?: any[];
    staff?: any[];
}) {
    const [studentId, setStudentId] = useState('');
    const [searching, setSearching] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    const [searchError, setSearchError] = useState('');
    const [activeTab, setActiveTab] = useState<BookingTab>('student');
    const [showWarning, setShowWarning] = useState(false);
    const [warningDate, setWarningDate] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        start_date: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split('T')[0], // Tomorrow
        end_date: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split('T')[0], // Tomorrow
        breakfast: 0,
        lunch: 1,
        dinner: 1,
    });

    const isRamadan = (usePage().props as any).isRamadan;

    const getMealName = (type: string) => {
        if (isRamadan) {
            const aliases: Record<string, string> = {
                breakfast: 'Sehri',
                lunch: 'Iftar',
                dinner: 'Dinner',
            };
            return (
                aliases[type] || type.charAt(0).toUpperCase() + type.slice(1)
            );
        }
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) return;

        setSearching(true);
        setSearchError('');
        setStudentData(null);

        try {
            const response = await fetch(
                `/admin/manual-booking/search?student_id=${studentId}`,
            );
            const result = await response.json();

            if (result.exists) {
                setStudentData({
                    exists: true,
                    user: result.user,
                    student: result.student,
                    hall: result.hall,
                    bookings: result.bookings || [],
                });
                setData('user_id', result.user.id);
            } else {
                setSearchError('No student found with this ID.');
            }
        } catch (error) {
            setSearchError('Error searching student. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const refreshBookings = async (userId: string | number) => {
        try {
            const response = await fetch(`/admin/manual-booking/bookings/${userId}`);
            const bookings = await response.json();
            setStudentData((prev: any) => ({
                ...prev,
                bookings: bookings
            }));
        } catch (error) {
            console.error('Error refreshing bookings:', error);
        }
    };

    const handleSelection = async (member: any, type: BookingTab) => {
        const mappedData = {
            exists: true,
            user: { id: member.id, name: member.name, status: member.status },
            student: {
                department: member.department || member.designation || 'Staff',
                balance: member.balance,
                room_number: member.teacher_id || member.staff_id || 'N/A',
            },
            hall: { name: member.hall },
            bookings: [],
        };
        setStudentData(mappedData);
        setData('user_id', member.id);
        setSearchError('');

        // Fetch bookings for this selection
        try {
            const response = await fetch(`/admin/manual-booking/bookings/${member.id}`);
            const bookings = await response.json();
            setStudentData((prev: any) => prev && prev.user.id === member.id ? { ...prev, bookings } : prev);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if window is closed for tomorrow
        const now = new Date();
        const hour = now.getHours();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const rangeIncludesTomorrow = data.start_date <= tomorrowStr && data.end_date >= tomorrowStr;

        if (hour >= 16 && rangeIncludesTomorrow) {
            setWarningDate(tomorrowStr);
            setShowWarning(true);
            return;
        }

        executeSubmit();
    };

    const executeSubmit = () => {
        post('/admin/manual-booking', {
            onSuccess: () => {
                // Refresh bookings after success
                if (data.user_id) {
                    refreshBookings(data.user_id);
                }
                setShowWarning(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manual Meal Booking" />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="space-y-1">
                    <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight tracking-tighter text-transparent uppercase">
                        Manual Meal Booking
                    </h1>
                    <p className="text-muted-foreground">
                        Select a member type and book meals for any date range.
                    </p>
                </div>

                {/* Tabs selection */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-muted-foreground/10 bg-muted/30 p-1.5">
                    <button
                        onClick={() => {
                            setActiveTab('student');
                            setStudentData(null);
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === 'student' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}
                    >
                        <Users className="h-4 w-4" />
                        Students
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('teacher');
                            setStudentData(null);
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === 'teacher' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}
                    >
                        <GraduationCap className="h-4 w-4" />
                        Teachers
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('staff');
                            setStudentData(null);
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === 'staff' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}
                    >
                        <Briefcase className="h-4 w-4" />
                        Staff
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Search / Selection Section */}
                    <Card className="overflow-hidden border-primary/10 shadow-sm md:col-span-5">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                {activeTab === 'student' ? (
                                    <Search className="h-5 w-5" />
                                ) : activeTab === 'teacher' ? (
                                    <GraduationCap className="h-5 w-5" />
                                ) : (
                                    <Briefcase className="h-5 w-5" />
                                )}
                                Selection
                            </CardTitle>
                            <CardDescription>
                                {activeTab === 'student'
                                    ? 'Enter the unique Student ID'
                                    : `Choose a ${activeTab} name`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {activeTab === 'student' ? (
                                <form
                                    onSubmit={handleSearch}
                                    className="space-y-3"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="student_id">
                                            University ID / Student ID
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="student_id"
                                                placeholder="e.g. 200101001"
                                                value={studentId}
                                                onChange={(e) =>
                                                    setStudentId(e.target.value)
                                                }
                                                className="font-mono"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={
                                                    searching || !studentId
                                                }
                                                size="icon"
                                            >
                                                {searching ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {searchError && (
                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                {searchError}
                                            </p>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <Label>
                                        Select{' '}
                                        {activeTab.charAt(0).toUpperCase() +
                                            activeTab.slice(1)}
                                    </Label>
                                    <select
                                        className="h-10 w-full rounded border bg-background px-3 text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                                const list =
                                                    activeTab === 'teacher'
                                                        ? teachers
                                                        : staff;
                                                const member = list.find(
                                                    (m) =>
                                                        m.id.toString() === val,
                                                );
                                                if (member)
                                                    handleSelection(
                                                        member,
                                                        activeTab,
                                                    );
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>
                                            Choose a name...
                                        </option>
                                        {(activeTab === 'teacher'
                                            ? teachers
                                            : staff
                                        ).map((m: any) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} (
                                                {m.teacher_id || m.staff_id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {studentData && (
                                <div className="mt-6 animate-in space-y-4 rounded-xl border border-green-200 bg-green-50/20 p-4 duration-300 fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-green-100 p-2 text-green-700">
                                            <UserCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm leading-tight font-bold text-green-900">
                                                {studentData.user.name}
                                            </p>
                                            <p className="text-xs text-green-700">
                                                {studentData.hall?.name ||
                                                    'No Hall'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-2 gap-y-3 border-t border-green-100 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold tracking-wider text-green-600 uppercase">
                                                Dept
                                            </p>
                                            <p className="text-sm font-medium">
                                                {studentData.student.department}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold tracking-wider text-green-600 uppercase">
                                                Status
                                            </p>
                                            <Badge
                                                variant={
                                                    studentData.user.status ===
                                                    'active'
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="h-5 text-[10px]"
                                            >
                                                {studentData.user.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold tracking-wider text-green-600 uppercase">
                                                Balance
                                            </p>
                                            <p
                                                className={`text-sm font-bold ${studentData.student.balance < 0 ? 'text-red-600' : 'text-green-600'}`}
                                            >
                                                {parseFloat(
                                                    studentData.student.balance,
                                                ).toFixed(2)}{' '}
                                                TK
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold tracking-wider text-green-600 uppercase">
                                                Room
                                            </p>
                                            <p className="text-sm font-medium">
                                                {
                                                    studentData.student
                                                        .room_number
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!studentData && !searching && !searchError && (
                                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted py-8 text-center text-muted-foreground">
                                    <div className="mb-3 rounded-full bg-muted p-3 opacity-20">
                                        <UserX className="h-8 w-8" />
                                    </div>
                                    <p className="text-sm">
                                        No student selected
                                    </p>
                                    <p className="text-[10px]">
                                        Search for a student to continue
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Booking Form Section */}
                    <Card
                        className={`shadow-sm transition-opacity duration-300 md:col-span-7 ${!studentData ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
                    >
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-500" />
                                Booking Details
                            </CardTitle>
                            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
                                <Info className="h-3 w-3" /> Booking for
                                tomorrow is allowed until 4:00 PM today.
                            </p>
                            <CardDescription>
                                Select range and meal quantities.
                                {new Date().getHours() >= 16 && (
                                    <span className="block mt-1 font-semibold text-amber-600">
                                        Note: Tomorrow's meals will be skipped.
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">
                                            From Date
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'start_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-3"
                                            />
                                        </div>
                                        {errors.start_date && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">
                                            To Date
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'end_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-3"
                                            />
                                        </div>
                                        {errors.end_date && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.end_date}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <Label className="text-sm font-semibold tracking-wide">
                                        Daily Meal Quantities
                                    </Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="group space-y-2">
                                            <div className="mb-1 flex items-center gap-2">
                                                <Coffee className="h-4 w-4 text-orange-400" />
                                                <Label
                                                    htmlFor="breakfast"
                                                    className="text-xs font-medium"
                                                >
                                                    {getMealName('breakfast')}
                                                </Label>
                                            </div>
                                            <Input
                                                id="breakfast"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={data.breakfast}
                                                onChange={(e) =>
                                                    setData(
                                                        'breakfast',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="h-12 border-orange-100 bg-orange-50/20 text-center text-lg font-bold transition-all focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div className="group space-y-2">
                                            <div className="mb-1 flex items-center gap-2">
                                                <Utensils className="h-4 w-4 text-blue-400" />
                                                <Label
                                                    htmlFor="lunch"
                                                    className="text-xs font-medium"
                                                >
                                                    {getMealName('lunch')}
                                                </Label>
                                            </div>
                                            <Input
                                                id="lunch"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={data.lunch}
                                                onChange={(e) =>
                                                    setData(
                                                        'lunch',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="h-12 border-blue-100 bg-blue-50/20 text-center text-lg font-bold transition-all focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="group space-y-2">
                                            <div className="mb-1 flex items-center gap-2">
                                                <Moon className="h-4 w-4 text-indigo-400" />
                                                <Label
                                                    htmlFor="dinner"
                                                    className="text-xs font-medium"
                                                >
                                                    {getMealName('dinner')}
                                                </Label>
                                            </div>
                                            <Input
                                                id="dinner"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={data.dinner}
                                                onChange={(e) =>
                                                    setData(
                                                        'dinner',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="h-12 border-indigo-100 bg-indigo-50/20 text-center text-lg font-bold transition-all focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Quantity will be applied to EACH day in
                                        the selected range.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={processing || !studentData}
                                        className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
                                    >
                                        {processing ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <Calendar className="mr-2 h-5 w-5" />
                                        )}
                                        Create Manual Booking
                                    </Button>
                                </div>
                                {(usePage().props as any).flash?.success && (
                                    <div className="mt-4 animate-in rounded-md border border-green-200 bg-green-100 p-3 text-sm text-green-700 duration-300 zoom-in-95">
                                        {(usePage().props as any).flash.success}
                                    </div>
                                )}
                                {((usePage().props as any).errors as any)
                                    .error && (
                                    <div className="mt-4 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                        {
                                            (
                                                (usePage().props as any)
                                                    .errors as any
                                            ).error
                                        }
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar Section */}
                {studentData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <BookingCalendar bookings={studentData.bookings || []} />
                    </div>
                )}

                <Dialog open={showWarning} onOpenChange={setShowWarning}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600">
                                <ShieldAlert className="h-5 w-5" />
                                Booking Window Warning
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                It's past <span className="font-bold text-foreground">4:00 PM</span>. 
                                The booking window for tomorrow (<span className="font-bold text-foreground">{warningDate}</span>) is closed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            Bookings for tomorrow will be <span className="font-bold underline">skipped</span>, but all other dates in your range will be processed normally.
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-end">
                            <Button variant="outline" onClick={() => setShowWarning(false)}>
                                Cancel
                            </Button>
                            <Button variant="default" onClick={executeSubmit}>
                                Proceed Anyway
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
