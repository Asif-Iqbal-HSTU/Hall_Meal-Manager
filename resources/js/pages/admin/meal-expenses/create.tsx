import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meal Expenses',
        href: '/admin/meal-expenses',
    },
    {
        title: 'Record Expenses',
        href: '/admin/meal-expenses/create',
    },
];

export default function MealExpenseCreate({ halls }: { halls: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        hall_id: halls[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        extra_mutton_charge: '',
        items: [{ name: '', unit_price: '', quantity: '' }],
    });

    const addItem = () => {
        setData('items', [...data.items, { name: '', unit_price: '', quantity: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...data.items] as any;
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/meal-expenses');
    };

    const totalCost = data.items.reduce((sum, item) => {
        const cost = (parseFloat(item.unit_price as string) || 0) * (parseFloat(item.quantity as string) || 0);
        return sum + cost;
    }, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Meal Expenses" />
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold">Record Daily Expenditure</h2>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {halls.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="hall_id">Hall</Label>
                                    <select
                                        id="hall_id"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={data.hall_id}
                                        onChange={(e) => setData('hall_id', e.target.value)}
                                    >
                                        {halls.map((hall) => (
                                            <option key={hall.id} value={hall.id}>{hall.name}</option>
                                        ))}
                                    </select>
                                    {errors.hall_id && <p className="text-red-500 text-xs">{errors.hall_id}</p>}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                                {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meal_type">Meal Type</Label>
                                <select
                                    id="meal_type"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.meal_type}
                                    onChange={(e) => setData('meal_type', e.target.value)}
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                </select>
                                {errors.meal_type && <p className="text-red-500 text-xs">{errors.meal_type}</p>}
                            </div>
                            {(data.meal_type === 'lunch' || data.meal_type === 'dinner') && (
                                <div className="space-y-2">
                                    <Label htmlFor="extra_mutton_charge">Extra Mutton Charge (Per Meal - optional)</Label>
                                    <Input
                                        id="extra_mutton_charge"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={data.extra_mutton_charge}
                                        onChange={(e) => setData('extra_mutton_charge', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground italic">Applied extra to mutton preference users.</p>
                                    {errors.extra_mutton_charge && <p className="text-red-500 text-xs">{errors.extra_mutton_charge}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Expenditure Items</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-4 w-4 mr-1" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-2 md:col-span-1">
                                        <Label>Item Name</Label>
                                        <Input
                                            placeholder="e.g. Rice, Chicken"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit Price (TK)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 text-right text-sm">
                                            <p className="text-muted-foreground">Total</p>
                                            <p className="font-bold">{((parseFloat(item.unit_price as string) || 0) * (parseFloat(item.quantity as string) || 0)).toFixed(2)} TK</p>
                                        </div>
                                        {data.items.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t flex justify-end">
                                <div className="text-right">
                                    <p className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Grand Total</p>
                                    <p className="text-3xl font-bold text-primary">{totalCost.toFixed(2)} TK</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="min-w-[120px]">
                            <Save className="h-4 w-4 mr-2" />
                            Save as Draft
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
