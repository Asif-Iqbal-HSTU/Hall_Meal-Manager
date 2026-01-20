import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: admin.dashboard().url,
    },
];

export default function AdminDashboard({ mealRequests, summary, meatSummary, date }: { mealRequests: any[], summary: any[], meatSummary: any, date: string }) {
    const [activeTab, setActiveTab] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');

    const filteredRequests = mealRequests.filter((r: any) => r.meal_type === activeTab);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meal Requests" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Meal Requests for {date}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['breakfast', 'lunch', 'dinner'].map((type) => {
                        const total = summary.find((s: any) => s.meal_type === type)?.total_quantity || 0;
                        return (
                            <Card
                                key={type}
                                className={`cursor-pointer transition-all ${activeTab === type ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => setActiveTab(type as any)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium uppercase">{type}</CardTitle>
                                        {activeTab === type && <div className="w-2 h-2 bg-primary rounded-full" />}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{total} Meals</div>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            Beef: {meatSummary[type]?.find((m: any) => m.meat_preference === 'beef')?.count || 0}
                                        </Badge>
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            Mutton: {meatSummary[type]?.find((m: any) => m.meat_preference === 'mutton')?.count || 0}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                    {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                        <Button
                            key={type}
                            variant={activeTab === type ? 'default' : 'ghost'}
                            size="sm"
                            className="capitalize"
                            onClick={() => setActiveTab(type)}
                        >
                            {type}
                        </Button>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="capitalize">{activeTab} Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto text-foreground">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-10 px-2 text-left font-semibold">Student Name</th>
                                        <th className="h-10 px-2 text-left font-semibold">Email</th>
                                        <th className="h-10 px-2 text-left font-semibold">Preference</th>
                                        <th className="h-10 px-2 text-left font-semibold">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((request: any) => (
                                        <tr key={request.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-2">{request.user.name}</td>
                                            <td className="p-2 text-muted-foreground">{request.user.email}</td>
                                            <td className="p-2">
                                                <Badge variant="secondary" className="capitalize">
                                                    {request.user.meat_preference}
                                                </Badge>
                                            </td>
                                            <td className="p-2 font-medium">{request.quantity}</td>
                                        </tr>
                                    ))}
                                    {filteredRequests.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                                No {activeTab} requests for tomorrow yet.
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
