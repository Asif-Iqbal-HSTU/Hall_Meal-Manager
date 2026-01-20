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
        title: 'Students',
        href: admin.students.index().url,
    },
    {
        title: 'Register Student',
        href: admin.students.create().url,
    },
];

export default function RegisterStudent({ halls }: { halls: { id: number; name: string }[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        student_id: '',
        department: '',
        batch: '',
        room_number: '',
        hall_id: '',
        meat_preference: 'beef',
        use_id_as_password: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.students.store().url, {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Student" />
            <div className="p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Register New Student</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="student_id">Student ID</Label>
                                    <Input
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        required
                                    />
                                    {errors.student_id && <p className="text-red-500 text-sm">{errors.student_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        required
                                    />
                                    {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="batch">Batch</Label>
                                    <Input
                                        id="batch"
                                        value={data.batch}
                                        onChange={(e) => setData('batch', e.target.value)}
                                        required
                                    />
                                    {errors.batch && <p className="text-red-500 text-sm">{errors.batch}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="room_number">Room Number</Label>
                                    <Input
                                        id="room_number"
                                        value={data.room_number}
                                        onChange={(e) => setData('room_number', e.target.value)}
                                        required
                                    />
                                    {errors.room_number && <p className="text-red-500 text-sm">{errors.room_number}</p>}
                                </div>
                            </div>

                            {halls && halls.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="hall_id">Assign Hall</Label>
                                    <select
                                        id="hall_id"
                                        className="w-full p-2 border rounded-md"
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
                                    {errors.hall_id && <p className="text-red-500 text-sm">{errors.hall_id}</p>}
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label>Meat Preference</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="meat_preference"
                                            value="beef"
                                            checked={data.meat_preference === 'beef'}
                                            onChange={(e) => setData('meat_preference', e.target.value)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span>Beef</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="meat_preference"
                                            value="mutton"
                                            checked={data.meat_preference === 'mutton'}
                                            onChange={(e) => setData('meat_preference', e.target.value)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span>Mutton</span>
                                    </label>
                                </div>
                                {errors.meat_preference && <p className="text-red-500 text-sm">{errors.meat_preference}</p>}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="use_id_as_password"
                                    checked={data.use_id_as_password}
                                    onChange={(e) => setData('use_id_as_password', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="use_id_as_password" title="Check this for existing students. Uncheck to generate random password and send email for new students.">
                                    Use Student ID as Password
                                </Label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    Register Student
                                </Button>
                                <Button variant="outline" asChild>
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
