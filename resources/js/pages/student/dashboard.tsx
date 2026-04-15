import BookingCalendar from '@/components/BookingCalendar';
import Snake from '@/components/Snake';
import TicTacToe from '@/components/TicTacToe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    Coffee,
    CreditCard,
    Gamepad2,
    History,
    Info,
    Moon,
    ShieldAlert,
    Utensils,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student Dashboard',
        href: student.dashboard().url,
    },
];

export default function StudentDashboard({
    user,
    bookings,
    pastBookings,
    monthlyCosts,
    stats,
    historicalRates,
    leaderboards,
}: {
    user: any;
    bookings: any[];
    pastBookings: any[];
    monthlyCosts: any[];
    stats: any;
    historicalRates: any;
    leaderboards: any;
}) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeGame, setActiveGame] = useState<'tictactoe' | 'snake'>(
        'tictactoe',
    );
    const [showWarning, setShowWarning] = useState(false);
    const [warningDate, setWarningDate] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const isAfterDeadline = currentTime.getHours() >= 16;

    // Range Booking Form
    const { data, setData, post, processing, errors, reset } = useForm({
        start_date: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split('T')[0], // Tomorrow
        end_date: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split('T')[0], // Tomorrow
        breakfast: 0,
        lunch: 1,
        dinner: 1,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if window is closed for tomorrow
        const now = new Date();
        const hour = now.getHours();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const rangeIncludesTomorrow = data.start_date <= tomorrowStr && data.end_date >= tomorrowStr;

        if (hour >= 16 && rangeIncludesTomorrow) {
            setWarningDate(tomorrowStr);
            setShowWarning(true);
            return;
        }

        executeSubmit();
    };

    const executeSubmit = () => {
        post(student.mealBookings.store().url, {
            onSuccess: () => {
                reset();
                setShowWarning(false);
            },
        });
    };

    const cancelBooking = (id: number) => {
        if (confirm('Are you sure you want to cancel this meal?')) {
            router.delete(student.mealBookings.destroy(id).url);
        }
    };

    const isDue = user.student.balance < 0;
    const absBalance = Math.abs(user.student.balance);

    const isRamadan = (usePage().props as any).isRamadan;

    const getMealName = (type: string) => {
        if (isRamadan) {
            const aliases: Record<string, string> = {
                breakfast: 'Sehri',
                lunch: 'Iftar',
                dinner: 'Dinner',
            };
            return (
                aliases[type] || type.charAt(0).toUpperCase() + type.slice(1)
            );
        }
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            <div className="space-y-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight italic">
                            Welcome, {user.name}
                        </h2>
                        <div className="mt-1 flex flex-col gap-1">
                            <p className="text-sm font-medium text-foreground">
                                {user.hall?.name || 'No Hall Assigned'}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tracking-wider text-muted-foreground uppercase">
                                {user.unique_id && (
                                    <span>
                                        <span className="font-semibold text-primary">
                                            UID:
                                        </span>{' '}
                                        {user.unique_id}
                                    </span>
                                )}
                                <span>
                                    <span className="font-semibold">ID:</span>{' '}
                                    {user.student.student_id}
                                </span>
                                <span>
                                    <span className="font-semibold">Dept:</span>{' '}
                                    {user.student.department}
                                </span>
                                <span>
                                    <span className="font-semibold">Room:</span>{' '}
                                    {user.student.room_number}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing & Stats Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card
                        className={
                            isDue
                                ? 'border-red-200 bg-red-50/10'
                                : 'border-green-200 bg-green-50/10'
                        }
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {isDue
                                    ? 'Payable Amount (Due)'
                                    : 'Current Balance'}
                            </CardTitle>
                            <Wallet
                                className={`h-4 w-4 ${isDue ? 'text-red-600' : 'text-green-600'}`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${isDue ? 'text-red-700' : 'text-green-700'}`}
                            >
                                {absBalance.toFixed(2)} TK
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {isDue
                                    ? 'Please deposit funds at the office'
                                    : 'Sufficient funds available'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Spent
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {parseFloat(stats.total_spent).toFixed(2)} TK
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Lifetime meal consumption
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Meals
                            </CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_meals} Units
                            </div>
                            <div className="mt-1 flex gap-2">
                                <span
                                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                                    title={getMealName('breakfast')}
                                >
                                    {getMealName('breakfast')[0]}:{' '}
                                    {stats.meal_counts.breakfast}
                                </span>
                                <span
                                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                                    title={getMealName('lunch')}
                                >
                                    {getMealName('lunch')[0]}:{' '}
                                    {stats.meal_counts.lunch}
                                </span>
                                <span
                                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                                    title={getMealName('dinner')}
                                >
                                    {getMealName('dinner')[0]}:{' '}
                                    {stats.meal_counts.dinner}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Booking Form */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                Plan Your Meals
                            </CardTitle>
                            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
                                <Info className="h-3 w-3" /> Booking & changes
                                for tomorrow are allowed until 4:00 PM today.
                            </p>
                        </CardHeader>
                        <CardContent>
                            {user.student.meal_enabled === false ? (
                                <div className="flex flex-col items-center justify-center space-y-6 py-10 text-center">
                                    <div className="rounded-full bg-red-100 p-4 text-red-600 ring-8 ring-red-50">
                                        <ShieldAlert className="h-10 w-10 text-red-500/80" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-foreground">
                                            Meal Requests Disabled
                                        </h3>
                                        <p className="mx-auto max-w-[300px] text-sm text-muted-foreground">
                                            Admin has disabled your meal requests. Please contact the authority.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">
                                                From Date
                                            </Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'start_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.start_date && (
                                                <p className="text-xs text-red-500">
                                                    {errors.start_date}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">
                                                To Date
                                            </Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'end_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.end_date && (
                                                <p className="text-xs text-red-500">
                                                    {errors.end_date}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                                            Daily Meal Quantities
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <Label
                                                    className="text-[10px]"
                                                    htmlFor="breakfast"
                                                >
                                                    {getMealName('breakfast')}
                                                </Label>
                                                <Input
                                                    id="breakfast"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={data.breakfast}
                                                    onChange={(e) =>
                                                        setData(
                                                            'breakfast',
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    className="text-[10px]"
                                                    htmlFor="lunch"
                                                >
                                                    {getMealName('lunch')}
                                                </Label>
                                                <Input
                                                    id="lunch"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={data.lunch}
                                                    onChange={(e) =>
                                                        setData(
                                                            'lunch',
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    className="text-[10px]"
                                                    htmlFor="dinner"
                                                >
                                                    {getMealName('dinner')}
                                                </Label>
                                                <Input
                                                    id="dinner"
                                                    type="number"
                                                    min="0"
                                                    max="5"
                                                    value={data.dinner}
                                                    onChange={(e) =>
                                                        setData(
                                                            'dinner',
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            Update Bookings
                                        </Button>
                                        <p className="mt-2 text-center text-[10px] text-muted-foreground">
                                            * Set quantity to 0 to remove a meal.
                                        </p>
                                    </div>
                                    {(usePage().props.errors as any).error && (
                                        <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                            {(usePage().props.errors as any).error}
                                        </div>
                                    )}
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Calendar View */}
                    <div className="h-full">
                        <BookingCalendar bookings={bookings} />
                    </div>
                </div>

                {/* Upcoming Bookings Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Upcoming Bookings List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-10 px-2 text-left text-muted-foreground">
                                            Date
                                        </th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">
                                            Meal
                                        </th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">
                                            Qty
                                        </th>
                                        <th className="h-10 px-2 text-left text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="h-10 px-2 text-right text-muted-foreground">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking: any) => {
                                        const now = currentTime;
                                        const todayStr =
                                            now.getFullYear() +
                                            '-' +
                                            String(
                                                now.getMonth() + 1,
                                            ).padStart(2, '0') +
                                            '-' +
                                            String(now.getDate()).padStart(
                                                2,
                                                '0',
                                            );

                                        const tomorrowDate = new Date(now);
                                        tomorrowDate.setDate(
                                            now.getDate() + 1,
                                        );
                                        const tomorrowStr =
                                            tomorrowDate.getFullYear() +
                                            '-' +
                                            String(
                                                tomorrowDate.getMonth() + 1,
                                            ).padStart(2, '0') +
                                            '-' +
                                            String(
                                                tomorrowDate.getDate(),
                                            ).padStart(2, '0');

                                        const isTomorrow =
                                            booking.booking_date ===
                                            tomorrowStr;
                                        const isCancellable =
                                            booking.booking_date > todayStr &&
                                            !(
                                                isTomorrow && isAfterDeadline
                                            );
                                        return (
                                            <tr
                                                key={booking.id}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <td className="p-2 font-mono text-xs">
                                                    {booking.booking_date}
                                                </td>
                                                <td className="p-2 capitalize">
                                                    <div className="flex items-center gap-2">
                                                        {booking.meal_type ===
                                                            'breakfast' && (
                                                            <Coffee className="h-3 w-3" />
                                                        )}
                                                        {booking.meal_type ===
                                                            'lunch' && (
                                                            <Utensils className="h-3 w-3" />
                                                        )}
                                                        {booking.meal_type ===
                                                            'dinner' && (
                                                            <Moon className="h-3 w-3" />
                                                        )}
                                                        {getMealName(
                                                            booking.meal_type,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2 font-semibold">
                                                    {booking.quantity}
                                                </td>
                                                <td className="p-2 text-muted-foreground">
                                                    {booking.is_taken ? (
                                                        <Badge variant="default">
                                                            Taken
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Scheduled
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-2 text-right">
                                                    {isCancellable && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() =>
                                                                cancelBooking(
                                                                    booking.id,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-6 text-center text-muted-foreground italic"
                                            >
                                                No upcoming bookings found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Previous Bookings - Simplified for space */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                            <History className="h-4 w-4 opacity-70" />
                            Recent History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative max-h-60 w-full overflow-auto">
                            <table className="w-full text-xs text-muted-foreground">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-8 px-2 text-left">
                                            Date
                                        </th>
                                        <th className="h-8 px-2 text-left">
                                            Meal
                                        </th>
                                        <th className="h-8 px-2 text-left">
                                            Qty
                                        </th>
                                        <th className="h-8 px-2 text-right">
                                            Cost
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastBookings.map((booking: any) => (
                                        <tr
                                            key={booking.id}
                                            className="border-b hover:bg-muted/10"
                                        >
                                            <td className="p-2 font-mono">
                                                {booking.booking_date}
                                            </td>
                                            <td className="p-2">
                                                {getMealName(booking.meal_type)}
                                            </td>
                                            <td className="p-2">
                                                {booking.quantity}
                                            </td>
                                            <td className="p-2 text-right">
                                                {parseFloat(booking.price) > 0
                                                    ? `${(booking.quantity * booking.price).toFixed(2)}`
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Leaderboards and Games (Keep existing) */}
                <div className="fixed right-6 bottom-6 z-40">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                size="icon"
                                className="h-14 w-14 rounded-full border-none bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-2xl transition-all duration-300 hover:scale-110"
                                title="Take a break with Tic Tac Toe!"
                            >
                                <Gamepad2 className="h-7 w-7" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-[700px]">
                            <DialogHeader>
                                <DialogTitle className="mb-2 flex items-center justify-center gap-2 text-center text-lg font-bold">
                                    <Gamepad2 className="h-5 w-5 text-indigo-600" />
                                    BAUST Student Game Hub
                                </DialogTitle>
                            </DialogHeader>
                            <div className="mb-4 flex justify-center gap-2 rounded-lg bg-muted p-1">
                                <Button
                                    variant={
                                        activeGame === 'tictactoe'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setActiveGame('tictactoe')}
                                >
                                    Tic Tac Toe
                                </Button>
                                <Button
                                    variant={
                                        activeGame === 'snake'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setActiveGame('snake')}
                                >
                                    Snake
                                </Button>
                            </div>
                            <div className="flex min-h-[400px] items-center justify-center">
                                {activeGame === 'tictactoe' ? (
                                    <TicTacToe
                                        leaderboard={leaderboards.tictactoe}
                                    />
                                ) : (
                                    <Snake leaderboard={leaderboards.snake} />
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <Dialog open={showWarning} onOpenChange={setShowWarning}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600">
                                <ShieldAlert className="h-5 w-5" />
                                Booking Window Warning
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                It's past <span className="font-bold text-foreground">4:00 PM</span>. 
                                The booking window for tomorrow (<span className="font-bold text-foreground">{warningDate}</span>) is closed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            Bookings for tomorrow will be <span className="font-bold underline">skipped</span>, but all other dates in your range will be processed normally.
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-end">
                            <Button variant="outline" onClick={() => setShowWarning(false)}>
                                Cancel
                            </Button>
                            <Button variant="default" onClick={executeSubmit} disabled={processing}>
                                Proceed Anyway
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
