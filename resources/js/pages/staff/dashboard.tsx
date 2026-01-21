import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { Coffee, Utensils, Moon, Wallet, History, CreditCard, Info, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff Dashboard',
        href: '/staff/dashboard',
    },
];

export default function StaffDashboard({ user, bookings, pastBookings, monthlyCosts, stats, historicalRates }: { user: any, bookings: any[], pastBookings: any[], monthlyCosts: any[], stats: any, historicalRates: any }) {
    const [currentTime, setCurrentTime] = useState(new Date());

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
        post('/staff/meal-bookings');
    };

    const isDue = user.staff.balance < 0;
    const absBalance = Math.abs(user.staff.balance);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 rounded-xl border gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm font-medium text-foreground">{user.hall?.name || 'No Hall Assigned'}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground uppercase tracking-wider">
                                <span><span className="font-semibold">ID:</span> {user.staff.staff_id}</span>
                                <span><span className="font-semibold">Designation:</span> {user.staff.designation}</span>
                                <span><span className="font-semibold">Pref:</span> {user.staff.meat_preference}</span>
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
                                {isDue ? 'Please settle with the mess manager' : 'Sufficient funds available'}
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

                {monthlyCosts && monthlyCosts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {monthlyCosts.map((mc: any) => (
                            <Card key={mc.id} className="border-blue-100 bg-blue-50/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs uppercase text-blue-600 flex items-center justify-between">
                                        Monthly Summary - {new Date(mc.year, mc.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        {mc.status === 'finalized' && <Badge className="bg-green-600 h-4 text-[8px] border-0 text-white">Finalized</Badge>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shared (Fuel/Spice/Cleaning)</span>
                                        <span className="font-semibold">{parseFloat(mc.total_amount).toFixed(2)} TK</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Seat Rent</span>
                                        <span className="font-semibold">{parseFloat(user.hall.seat_rent).toFixed(2)} TK</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic mt-2">Shared costs are distributed per meal booking.</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Booking Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="h-5 w-5" />
                                Book Staff's Meal
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
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
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
                                        <span>Booking window: 08 AM - 11:59 PM</span>
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

                    {/* Recent Rates Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Calculated Meal Rates (Last 3 Finalized)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['breakfast', 'lunch', 'dinner'].map((type) => (
                                <div key={type} className="space-y-2 border-b last:border-0 pb-2 last:pb-0">
                                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{type}</h4>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {historicalRates[type]?.length > 0 ? (
                                            historicalRates[type].map((rate: any, idx: number) => (
                                                <div key={idx} className="flex-1 min-w-[80px] p-2 bg-muted/30 rounded-md text-center border">
                                                    <p className="text-[8px] text-muted-foreground">{new Date(rate.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                                    <p className="text-sm font-bold">{parseFloat(rate.calculated_price).toFixed(2)} TK</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground italic px-2">No finalized records yet</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings Table */}
                <div className="grid grid-cols-1 gap-6">
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
                                                <td className="p-2 text-muted-foreground">
                                                    {parseFloat(booking.price) > 0 ? `${parseFloat(booking.price).toFixed(2)} TK` : <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pending</span>}
                                                </td>
                                                <td className="p-2 font-bold text-right">
                                                    {parseFloat(booking.price) > 0 ? `${(booking.quantity * booking.price).toFixed(2)} TK` : '-'}
                                                </td>
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-muted-foreground">
                                <History className="h-5 w-5 opacity-70" />
                                Previous Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-xs uppercase text-muted-foreground tracking-wider">
                                            <th className="h-10 px-2 text-left">Date</th>
                                            <th className="h-10 px-2 text-left">Meal</th>
                                            <th className="h-10 px-2 text-left">Qty</th>
                                            <th className="h-10 px-2 text-left">Rate</th>
                                            <th className="h-10 px-2 text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="opacity-80">
                                        {pastBookings.map((booking: any) => {
                                            const isMuttonMeal = (booking.meal_type === 'lunch' || booking.meal_type === 'dinner') && user.staff.meat_preference?.toLowerCase() === 'mutton';
                                            return (
                                                <tr key={booking.id} className="border-b hover:bg-muted/10 transition-colors">
                                                    <td className="p-2 font-mono text-xs">{booking.booking_date}</td>
                                                    <td className="p-2 capitalize text-xs">
                                                        <div className="flex items-center gap-1">
                                                            {booking.meal_type}
                                                            {isMuttonMeal && <Badge variant="outline" className="h-3 text-[8px] border-amber-500 text-amber-600 px-1 py-0 font-normal">Mutton</Badge>}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-xs">{booking.quantity}</td>
                                                    <td className="p-2 text-xs">
                                                        {parseFloat(booking.price) > 0 ? `${parseFloat(booking.price).toFixed(2)} TK` : 'Adjusting...'}
                                                    </td>
                                                    <td className="p-2 font-mono text-xs text-right">
                                                        {parseFloat(booking.price) > 0 ? `${(booking.quantity * booking.price).toFixed(2)} TK` : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {pastBookings.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-muted-foreground italic">
                                                    No past history found.
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
        </AppLayout>
    );
}
