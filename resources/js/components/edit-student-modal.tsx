import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface EditStudentModalProps {
    student: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditStudentModal({ student, open, onOpenChange }: EditStudentModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        student_id: '',
        department: '',
        batch: '',
        room_number: '',
        meat_preference: 'beef',
    });

    useEffect(() => {
        if (student) {
            setData({
                name: student.name || '',
                email: student.email || '',
                student_id: student.student_id || '',
                department: student.department || '',
                batch: student.batch || '',
                room_number: student.room_number || '',
                meat_preference: student.meat_preference || 'beef',
            });
        }
    }, [student]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!student?.id) return;

        put(`/admin/students/${student.id}`, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Student Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="student_id">Student ID</Label>
                        <Input
                            id="student_id"
                            value={data.student_id}
                            onChange={(e) => setData('student_id', e.target.value)}
                            required
                        />
                        {errors.student_id && <p className="text-red-500 text-xs">{errors.student_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address (Optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Dept</Label>
                            <Input
                                id="department"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batch">Batch</Label>
                            <Input
                                id="batch"
                                value={data.batch}
                                onChange={(e) => setData('batch', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="room_number">Room</Label>
                            <Input
                                id="room_number"
                                value={data.room_number}
                                onChange={(e) => setData('room_number', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meat_preference">Meat Preference</Label>
                        <select
                            id="meat_preference"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={data.meat_preference}
                            onChange={(e) => setData('meat_preference', e.target.value as 'beef' | 'mutton')}
                        >
                            <option value="beef">Beef</option>
                            <option value="mutton">Mutton</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
