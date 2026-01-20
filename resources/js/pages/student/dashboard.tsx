import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { Coffee, Utensils, Moon, Wallet, History, CreditCard, Info } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student Dashboard',
        href: student.dashboard().url,
    },
];

export default function StudentDashboard({ bookings, stats }: { bookings: any[], stats: any }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const user = (usePage().props as unknown as SharedData).auth.user;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const { data, setData, post, processing, errors } = useForm({
        meal_type: 'lunch',
        quantity: 1,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(student.mealBookings.store().url);
    };

    const isDue = user.balance < 0;
    const absBalance = Math.abs(user.balance);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 rounded-xl border gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm font-medium text-foreground">{user.hall_name || 'No Hall Assigned'}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground uppercase tracking-wider">
                                <span><span className="font-semibold">ID:</span> {user.student_id}</span>
                                <span><span className="font-semibold">Dept:</span> {user.department}</span>
                                <span><span className="font-semibold">Batch:</span> {user.batch}</span>
                                <span><span className="font-semibold">Room:</span> {user.room_number}</span>
                                <span><span className="font-semibold">Pref:</span> {user.meat_preference}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-3xl font-mono font-bold text-primary">{timeString}</div>
                        <p className="text-sm text-muted-foreground">{currentTime.toDateString()}</p>
                    </div>
                </div>

                {/* Billing & Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className={isDue ? 'border-red-200 bg-red-50/10' : 'border-green-200 bg-green-50/10'}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {isDue ? 'Payable Amount (Due)' : 'Current Balance'}
                            </CardTitle>
                            <Wallet className={`h-4 w-4 ${isDue ? 'text-red-600' : 'text-green-600'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${isDue ? 'text-red-700' : 'text-green-700'}`}>
                                {absBalance.toFixed(2)} TK
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isDue ? 'Please deposit funds at the office' : 'Sufficient funds available'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{parseFloat(stats.total_spent).toFixed(2)} TK</div>
                            <p className="text-xs text-muted-foreground mt-1">Lifetime meal consumption</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_meals} Units</div>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded" title="Breakfast">B: {stats.meal_counts.breakfast}</span>
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded" title="Lunch">L: {stats.meal_counts.lunch}</span>
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded" title="Dinner">D: {stats.meal_counts.dinner}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Booking Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="h-5 w-5" />
                                Book Meal for Tomorrow
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meal_type">Meal Type</Label>
                                        <select
                                            id="meal_type"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={data.meal_type}
                                            onChange={(e) => setData('meal_type', e.target.value)}
                                        >
                                            <option value="breakfast">Breakfast ({user.hall?.breakfast_price} TK)</option>
                                            <option value="lunch">Lunch ({user.hall?.lunch_price} TK)</option>
                                            <option value="dinner">Dinner ({user.hall?.dinner_price} TK)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseInt(e.target.value))}
                                        />
                                        {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                        Confirm Booking
                                    </Button>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Info className="h-3 w-3" />
                                        <span>Booking window: 08 AM - 04 PM</span>
                                    </div>
                                </div>
                                {(usePage().props.errors as any).error && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                                        {(usePage().props.errors as any).error}
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Pricing Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Info className="h-4 w-4" />
                                Current Meal Rates ({user.hall_name})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-2">
                            <div className="p-3 bg-muted/30 rounded-lg text-center">
                                <Coffee className="h-4 w-4 mx-auto mb-1 opacity-50" />
                                <p className="text-xs uppercase font-semibold">Breakfast</p>
                                <p className="text-lg font-bold">{user.hall?.breakfast_price} TK</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg text-center">
                                <Utensils className="h-4 w-4 mx-auto mb-1 opacity-50" />
                                <p className="text-xs uppercase font-semibold">Lunch</p>
                                <p className="text-lg font-bold">{user.hall?.lunch_price} TK</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg text-center">
                                <Moon className="h-4 w-4 mx-auto mb-1 opacity-50" />
                                <p className="text-xs uppercase font-semibold">Dinner</p>
                                <p className="text-lg font-bold">{user.hall?.dinner_price} TK</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Upcoming Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-10 px-2 text-left text-muted-foreground">Date</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">Meal Type</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">Qty</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">Rate</th>
                                        <th className="h-10 px-2 text-left text-muted-foreground text-right">Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking: any) => (
                                        <tr key={booking.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-2 font-mono text-xs">{booking.booking_date}</td>
                                            <td className="p-2 capitalize">
                                                <div className="flex items-center gap-2">
                                                    {booking.meal_type === 'breakfast' && <Coffee className="h-3 w-3" />}
                                                    {booking.meal_type === 'lunch' && <Utensils className="h-3 w-3" />}
                                                    {booking.meal_type === 'dinner' && <Moon className="h-3 w-3" />}
                                                    {booking.meal_type}
                                                </div>
                                            </td>
                                            <td className="p-2 font-semibold">{booking.quantity}</td>
                                            <td className="p-2 text-muted-foreground">{booking.price} TK</td>
                                            <td className="p-2 font-bold text-right">{(booking.quantity * booking.price).toFixed(2)} TK</td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-muted-foreground italic">
                                                No upcoming bookings found.
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
