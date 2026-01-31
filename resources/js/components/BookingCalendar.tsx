import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Moon, Sun, Sunrise, Utensils } from 'lucide-react';
import { useState } from 'react';

export default function BookingCalendar({ bookings }: { bookings: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getBookingsForDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookings.filter(b => b.booking_date === dateStr);
    };

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 bg-muted/20 border border-border/50" />);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dailyBookings = getBookingsForDate(day);
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

        days.push(
            <div key={day} className={`h-24 border border-border/50 p-1 relative hover:bg-muted/30 transition-colors ${isToday ? 'bg-primary/5 border-primary' : ''}`}>
                <div className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'} mb-1`}>{day}</div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dailyBookings.map((booking: any) => (
                        <div key={booking.id} className="text-[10px] flex items-center gap-1 bg-background border px-1 py-0.5 rounded shadow-sm text-foreground/80 truncate">
                            {booking.meal_type === 'breakfast' && <Sunrise className="h-3 w-3 text-orange-500" />}
                            {booking.meal_type === 'lunch' && <Utensils className="h-3 w-3 text-blue-500" />}
                            {booking.meal_type === 'dinner' && <Moon className="h-3 w-3 text-indigo-500" />}
                            <span className="truncate capitalize">{booking.meal_type}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Booking Calendar</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-bold w-24 text-center">
                        {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-0 text-center text-xs font-medium text-muted-foreground mb-1">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-0 border bg-card rounded-md overflow-hidden">
                    {days}
                </div>
            </CardContent>
        </Card>
    );
}
