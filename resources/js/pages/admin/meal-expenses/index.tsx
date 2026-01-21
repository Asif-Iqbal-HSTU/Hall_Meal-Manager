import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meal Expenses',
        href: '/admin/meal-expenses',
    },
];

export default function MealExpensesIndex({ expenses, halls, selectedHallId }: { expenses: any, halls: any[], selectedHallId: number }) {
    const handleFinalize = (id: number) => {
        if (confirm('Are you sure you want to finalize this day? This will calculate the per-meal price and deduct from all booked users\' balances.')) {
            router.post(`/admin/meal-expenses/${id}/finalize`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meal Expenses" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Meal Expenditure Management</h2>
                        <p className="text-sm text-muted-foreground">Manage daily costs and finalize meal pricing.</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/meal-expenses/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Record Expenses
                        </Link>
                    </Button>
                </div>

                {halls.length > 0 && (
                    <div className="flex gap-4">
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedHallId}
                            onChange={(e) => router.get('/admin/meal-expenses', { hall_id: e.target.value })}
                        >
                            {halls.map((hall) => (
                                <option key={hall.id} value={hall.id}>{hall.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Expenditure History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-10 px-2 text-left text-muted-foreground">Date</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">Meal Type</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground text-right">Total Cost</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground text-right">Per Meal Price</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">Status</th>
                                        <th className="h-10 px-2 text-right text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.data.map((expense: any) => (
                                        <tr key={expense.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-2 font-mono">{expense.date}</td>
                                            <td className="p-2 capitalize">{expense.meal_type}</td>
                                            <td className="p-2 text-right font-semibold">{parseFloat(expense.total_cost).toFixed(2)} TK</td>
                                            <td className="p-2 text-right">
                                                {expense.calculated_price ? (
                                                    <span className="font-bold text-primary">{parseFloat(expense.calculated_price).toFixed(2)} TK</span>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Pending</span>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {expense.status === 'finalized' ? (
                                                    <Badge variant="default" className="bg-green-600">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Finalized
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        Draft
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-2 text-right space-x-2">
                                                {expense.status === 'draft' && (
                                                    <>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/admin/meal-expenses/${expense.id}/edit`}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button variant="default" size="sm" onClick={() => handleFinalize(expense.id)}>
                                                            Finalize
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-muted-foreground italic">
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
