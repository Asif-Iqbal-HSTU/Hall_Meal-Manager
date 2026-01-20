import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';

interface DepositBalanceModalProps {
    student: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DepositBalanceModal({ student, open, onOpenChange }: DepositBalanceModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        note: 'Balance Deposit',
        payment_date: new Date().toISOString().split('T')[0],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!student?.id) return;

        post(`/admin/students/${student.id}/payments`, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Deposit Balance - {student?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (TK)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="Enter amount"
                            required
                        />
                        {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment_date">Date</Label>
                        <Input
                            id="payment_date"
                            type="date"
                            value={data.payment_date}
                            onChange={(e) => setData('payment_date', e.target.value)}
                            required
                        />
                        {errors.payment_date && <p className="text-red-500 text-xs">{errors.payment_date}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Note (Optional)</Label>
                        <Input
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="Deposit details..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Confirm Deposit</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
