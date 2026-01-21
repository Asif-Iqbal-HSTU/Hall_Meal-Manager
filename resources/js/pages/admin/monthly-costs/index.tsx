import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Save, Calendar, Eye, Receipt, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Monthly Costs',
        href: '/admin/monthly-costs',
    },
];

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyCostsIndex({ costs, halls, selectedHallId }: { costs: any, halls: any[], selectedHallId: number }) {
    const selectedHall = halls.find(h => h.id === selectedHallId) || halls[0];

    const { data, setData, post, processing, errors } = useForm({
        hall_id: selectedHallId || (halls[0]?.id || ''),
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        fuel_charge: '',
        spice_charge: '',
        cleaning_charge: '',
        other_charge: 0,
    });

    const [selectedCost, setSelectedCost] = useState<any>(null);

    const settingsForm = useForm({
        seat_rent: selectedHall?.seat_rent || 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/monthly-costs');
    };

    const handleFinalize = (id: number) => {
        if (confirm('Are you sure you want to finalize this month? This will distribute shared costs per meal and apply seat rent to all users.')) {
            router.post(`/admin/monthly-costs/${id}/finalize`);
        }
    };

    const updateSettings = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/admin/halls/${selectedHallId}/settings`, settingsForm.data);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monthly Shared Costs" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Monthly Shared Costs & Rent</h2>
                    {halls.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Label>Filter Hall:</Label>
                            <select
                                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                                value={selectedHallId}
                                onChange={(e) => router.get('/admin/monthly-costs', { hall_id: e.target.value })}
                            >
                                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Hall Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={updateSettings} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Seat Rent (Monthly per User)</Label>
                                        <Input
                                            type="number"
                                            value={settingsForm.data.seat_rent}
                                            onChange={e => settingsForm.setData('seat_rent', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <Button type="submit" variant="outline" className="w-full" disabled={settingsForm.processing}>
                                        <Save className="h-4 w-4 mr-2" /> Update Seat Rent
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Record Monthly Charges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Year</Label>
                                            <Input type="number" value={data.year} onChange={e => setData('year', parseInt(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Month</Label>
                                            <select
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={data.month}
                                                onChange={e => setData('month', parseInt(e.target.value))}
                                            >
                                                {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fuel Charge (TK)</Label>
                                        <Input type="number" step="0.01" value={data.fuel_charge} onChange={e => setData('fuel_charge', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Spices Charge (TK)</Label>
                                        <Input type="number" step="0.01" value={data.spice_charge} onChange={e => setData('spice_charge', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cleaning Charge (TK)</Label>
                                        <Input type="number" step="0.01" value={data.cleaning_charge} onChange={e => setData('cleaning_charge', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Other Charges (TK)</Label>
                                        <Input type="number" step="0.01" value={data.other_charge} onChange={e => setData('other_charge', parseFloat(e.target.value) || 0)} />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" /> Save Draft
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-10 px-2 text-left text-muted-foreground font-medium">Period</th>
                                            <th className="h-10 px-2 text-left text-muted-foreground font-medium">Total Shared</th>
                                            <th className="h-10 px-2 text-left text-muted-foreground font-medium">Status</th>
                                            <th className="h-10 px-2 text-right text-muted-foreground font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {costs.data.map((c: any) => (
                                            <tr key={c.id}>
                                                <td className="p-2 font-medium">
                                                    {months[c.month - 1]} {c.year}
                                                </td>
                                                <td className="p-2">{parseFloat(c.total_amount).toFixed(2)} TK</td>
                                                <td className="p-2">
                                                    {c.status === 'finalized' ? (
                                                        <Badge variant="default" className="bg-green-600 border-0 text-white">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Finalized
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                                                            <AlertCircle className="h-3 w-3 mr-1" /> Draft
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-2 text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => setSelectedCost(c)}
                                                        title="View Breakdown"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {c.status !== 'finalized' && (
                                                        <Button size="sm" variant="outline" onClick={() => handleFinalize(c.id)}>
                                                            Finalize
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {costs.data.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                                    No monthly costs recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Breakdown Modal */}
            <Dialog open={!!selectedCost} onOpenChange={() => setSelectedCost(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-indigo-600" />
                            Cost Breakdown
                        </DialogTitle>
                        <DialogDescription>
                            Detailed charges for {selectedCost && `${months[selectedCost.month - 1]} ${selectedCost.year}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCost && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Fuel Charge</Label>
                                    <p className="font-bold">{parseFloat(selectedCost.fuel_charge).toFixed(2)} TK</p>
                                </div>
                                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Spices Charge</Label>
                                    <p className="font-bold">{parseFloat(selectedCost.spice_charge).toFixed(2)} TK</p>
                                </div>
                                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Cleaning Charge</Label>
                                    <p className="font-bold">{parseFloat(selectedCost.cleaning_charge).toFixed(2)} TK</p>
                                </div>
                                <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Other Charges</Label>
                                    <p className="font-bold">{parseFloat(selectedCost.other_charge).toFixed(2)} TK</p>
                                </div>
                            </div>

                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Total Shared Amount</p>
                                    <p className="text-2xl font-black text-indigo-900">{parseFloat(selectedCost.total_amount).toFixed(2)} TK</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={selectedCost.status === 'finalized' ? 'default' : 'outline'} className={selectedCost.status === 'finalized' ? 'bg-green-600' : 'text-amber-600 border-amber-600'}>
                                        {selectedCost.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setSelectedCost(null)} variant="secondary" className="w-full">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
