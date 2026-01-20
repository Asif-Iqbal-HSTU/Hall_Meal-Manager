import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members',
        href: admin.students.index().url,
    },
    {
        title: 'Register Member',
        href: '#', // Generic during registration
    },
];

const DEPARTMENTS = ['CSE', 'ICT', 'EEE', 'ME', 'IPE', 'DBA', 'AIS', 'Eng', 'CE'];
const TEACHER_DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
const STAFF_DESIGNATIONS = ['Hall Manager', 'Mess Manager', 'Account Clerk', 'Building Supervisor'];

export default function RegisterStudent({ halls }: { halls: { id: number; name: string }[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        student_id: '',
        unique_id: '',
        department: '',
        batch: '',
        room_number: '',
        designation: '',
        hall_id: '',
        meat_preference: 'beef',
        user_type: 'student',
        use_id_as_password: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        let storeUrl = admin.students.store().url;
        if (data.user_type === 'teacher') {
            storeUrl = '/admin/teachers'; // Using literal or generated route
        } else if (data.user_type === 'staff') {
            storeUrl = '/admin/staff';
        }

        post(storeUrl, {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Member" />
            <div className="p-6">
                <Card className="max-w-2xl mx-auto border-emerald-100 shadow-xl shadow-emerald-500/5">
                    <CardHeader className="bg-emerald-50/50 border-b pb-6">
                        <CardTitle className="text-2xl font-black text-emerald-950">Register New Member</CardTitle>
                        <p className="text-emerald-700/60 text-sm">Add a new student, teacher, or staff member to the hall meal system.</p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={submit} className="space-y-8">
                            {/* Member Type - PLACED FIRST */}
                            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                                <Label htmlFor="user_type" className="text-emerald-900 font-bold uppercase tracking-widest text-[10px]">Member Type Selection</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['student', 'teacher', 'staff'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                setData((prev) => ({
                                                    ...prev,
                                                    user_type: type as any,
                                                    designation: '', // Reset designation when type changes
                                                    department: type === 'staff' ? '' : prev.department, // Reset dept if staff
                                                }));
                                            }}
                                            className={`py-3 px-4 rounded-lg text-sm font-bold transition-all border-2 capitalize ${data.user_type === type
                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]'
                                                : 'bg-background border-muted hover:border-emerald-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                {errors.user_type && <p className="text-red-500 text-xs font-medium">{errors.user_type}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        placeholder="Enter full name"
                                        className="h-11"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="student_id" className="text-xs font-bold uppercase tracking-tight">ID / Reference</Label>
                                    <Input
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        required
                                        placeholder={`${data.user_type.charAt(0).toUpperCase() + data.user_type.slice(1)} ID`}
                                        className="h-11 font-mono"
                                    />
                                    {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase">Email Address (Optional)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="example@mail.com"
                                        className="h-11"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* CONDITIONAL DEPARTMENT DROPDOWN */}
                                {data.user_type !== 'staff' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="department" className="text-xs font-bold uppercase">Department</Label>
                                        <select
                                            id="department"
                                            className="w-full h-11 px-3 border rounded-md text-sm bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {DEPARTMENTS.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                                    </div>
                                )}

                                {/* CONDITIONAL DESIGNATION DROPDOWN */}
                                {data.user_type !== 'student' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="designation" className="text-xs font-bold uppercase">Designation</Label>
                                        <select
                                            id="designation"
                                            className="w-full h-11 px-3 border rounded-md text-sm bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.designation}
                                            onChange={(e) => setData('designation', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Designation</option>
                                            {(data.user_type === 'teacher' ? TEACHER_DESIGNATIONS : STAFF_DESIGNATIONS).map(desig => (
                                                <option key={desig} value={desig}>{desig}</option>
                                            ))}
                                        </select>
                                        {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                                    </div>
                                )}

                                {/* CONDITIONAL FIELDS FOR STUDENTS */}
                                {data.user_type === 'student' && (
                                    <>
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label htmlFor="batch" className="text-xs font-bold uppercase">Batch</Label>
                                            <Input
                                                id="batch"
                                                value={data.batch}
                                                onChange={(e) => setData('batch', e.target.value)}
                                                required
                                                placeholder="e.g. 15th"
                                                className="h-11"
                                            />
                                            {errors.batch && <p className="text-red-500 text-xs mt-1">{errors.batch}</p>}
                                        </div>
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
                                            <Label htmlFor="room_number" className="text-xs font-bold uppercase">Room Number</Label>
                                            <Input
                                                id="room_number"
                                                value={data.room_number}
                                                onChange={(e) => setData('room_number', e.target.value)}
                                                required
                                                placeholder="e.g. 302"
                                                className="h-11"
                                            />
                                            {errors.room_number && <p className="text-red-500 text-xs mt-1">{errors.room_number}</p>}
                                        </div>
                                    </>
                                )}

                                {halls && halls.length > 0 && (
                                    <div className="space-y-2 col-span-full">
                                        <Label htmlFor="hall_id" className="text-xs font-bold uppercase">Assign Hall</Label>
                                        <select
                                            id="hall_id"
                                            className="w-full h-11 px-3 border rounded-md text-sm bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.hall_id}
                                            onChange={(e) => setData('hall_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select a Hall</option>
                                            {halls.map((hall) => (
                                                <option key={hall.id} value={hall.id}>
                                                    {hall.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.hall_id && <p className="text-red-500 text-xs mt-1">{errors.hall_id}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                                <Label className="text-[10px] font-black uppercase text-amber-900 tracking-widest">Meat Preference</Label>
                                <div className="flex gap-4">
                                    {['beef', 'mutton'].map((pref) => (
                                        <label key={pref} className="flex flex-1 items-center justify-center gap-2 cursor-pointer p-3 bg-background rounded-lg border-2 hover:border-amber-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/5 transition-all">
                                            <input
                                                type="radio"
                                                name="meat_preference"
                                                value={pref}
                                                checked={data.meat_preference === pref}
                                                onChange={(e) => setData('meat_preference', e.target.value)}
                                                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                                            />
                                            <span className="capitalize font-bold text-amber-950">{pref}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.meat_preference && <p className="text-red-500 text-xs mt-1">{errors.meat_preference}</p>}
                            </div>

                            <div className="flex items-center gap-3 p-4 border rounded-xl bg-muted/20">
                                <input
                                    type="checkbox"
                                    id="use_id_as_password"
                                    checked={data.use_id_as_password}
                                    onChange={(e) => setData('use_id_as_password', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                    <Label htmlFor="use_id_as_password" className="font-bold text-sm">
                                        Use ID as Password
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Recommended for existing data migrations</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button type="submit" disabled={processing} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/20">
                                    Complete Registration
                                </Button>
                                <Button variant="outline" asChild className="h-12 px-8">
                                    <Link href={admin.students.index().url}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
