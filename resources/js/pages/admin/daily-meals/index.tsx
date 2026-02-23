import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { Utensils, Search, Calendar, Filter } from 'lucide-react';

export default function DailyMealsIndex({ users, date, mealType, auth }: { users: any[], date: string, mealType: string, auth: any }) {
    const [searchTerm, setSearchTerm] = useState('');

    const breadcrumbs = [
        { title: 'Admin Dashboard', href: admin.dashboard().url },
        { title: 'Daily Meals', href: admin.dailyMeals.index().url },
    ];

    const isRamadan = (usePage().props as any).isRamadan;

    const getMealName = (type: string) => {
        if (isRamadan) {
            const aliases: Record<string, string> = {
                'breakfast': 'Sehri',
                'lunch': 'Iftar',
                'dinner': 'Dinner'
            };
            return aliases[type] || type.charAt(0).toUpperCase() + type.slice(1);
        }
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const { data, setData, get } = useForm({
        date: date,
        meal_type: mealType,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get(admin.dailyMeals.index().url, { preserveState: true });
    };

    const toggleStatus = (user: any, checked: boolean) => {
        router.post(admin.dailyMeals.toggle().url, {
            user_id: user.id,
            date: data.date,
            meal_type: data.meal_type,
            is_taken: checked,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.unique_id && user.unique_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Meal Management" />
            <div className="p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="h-5 w-5" />
                            Daily Meal Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end border-b pb-6 mb-6">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meal_type">Meal Type</Label>
                                <select
                                    id="meal_type"
                                    className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={data.meal_type}
                                    onChange={(e) => setData('meal_type', e.target.value)}
                                >
                                    <option value="breakfast">{getMealName('breakfast')}</option>
                                    <option value="lunch">{getMealName('lunch')}</option>
                                    <option value="dinner">{getMealName('dinner')}</option>
                                </select>
                            </div>
                            <Button type="submit">
                                <Filter className="h-4 w-4 mr-2" />
                                Load List
                            </Button>
                        </form>

                        <div className="flex justify-between items-center mb-4">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Name or ID..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Showing {filteredUsers.length} members
                            </div>
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="p-3">Member</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Booking Qty</th>
                                        <th className="p-3 text-center">Status (Taken)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/10 bg-card">
                                            <td className="p-3">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.unique_id || `ID: ${user.id}`}</div>
                                            </td>
                                            <td className="p-3 capitalize text-xs">{user.user_type || user.role}</td>
                                            <td className="p-3">
                                                {user.quantity > 0 ? (
                                                    <Badge variant="outline">{user.quantity}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Checkbox
                                                    checked={!!user.is_taken}
                                                    onCheckedChange={(checked) => toggleStatus(user, checked as boolean)}
                                                    className="w-5 h-5 mx-auto"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                                No members found.
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
