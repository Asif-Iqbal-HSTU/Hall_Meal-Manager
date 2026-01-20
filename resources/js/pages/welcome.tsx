import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { logout } from '@/routes';
import { type SharedData } from '@/types';
import { Utensils, ShieldCheck, Clock, CreditCard, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a] selection:bg-emerald-500 selection:text-white font-sans">
            <Head title="Welcome to BAUST Meal Management" />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b bg-white/80 dark:bg-black/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo/logo.png" alt="BAUST Logo" className="h-10 w-auto" />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-tight leading-none text-emerald-800 dark:text-emerald-100">BAUST</span>
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 tracking-wider uppercase">Meal Management</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {auth.user ? (
                                <>
                                    <Link href={dashboard().url} className="hidden sm:flex inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2">
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <Link href={logout().url} method="post" as="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-transparent shadow-sm hover:bg-red-50 text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/20 h-9 px-3 gap-2">
                                        <LogOut className="h-4 w-4" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={login().url} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 whitespace-nowrap">
                                        Log in
                                    </Link>
                                    <Link href={login().url} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 h-9 px-4 whitespace-nowrap">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-16 px-4 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-50 dark:opacity-20">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-100 dark:border-emerald-800 shadow-sm">
                            <Utensils className="h-4 w-4" />
                            Smart Meal Management for BAUST Halls
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
                            The most efficient way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-500">manage hall meals.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Automate student bookings, manage prices, track billing, and streamline hall operations with our comprehensive solution tailored for BAUST.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href={auth.user ? dashboard().url : login().url}>
                                <Button size="lg" className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white text-lg rounded-2xl shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-1">
                                    {auth.user ? 'Go to Dashboard' : 'Get Started Now'}
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Smart Bookings',
                                desc: 'Students can easily book breakfast, lunch, and dinner for the next day within the regular window.',
                                icon: Clock,
                                color: 'bg-emerald-500'
                            },
                            {
                                title: 'Prepaid Wallet',
                                desc: 'Automated balance tracking ensures meal costs are deducted accurately from student accounts.',
                                icon: CreditCard,
                                color: 'bg-amber-500'
                            },
                            {
                                title: 'Hall Admin Tools',
                                desc: 'Manage students, track payment deposits, and generate meal preparation lists with ease.',
                                icon: ShieldCheck,
                                color: 'bg-emerald-700'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-[2.5rem] bg-white dark:bg-[#161615] border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 dark:text-white leading-tight">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-md">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-32 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-black py-16 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo/logo.png" alt="BAUST Logo" className="h-10 w-auto grayscale contrast-125 opacity-70" />
                        <div className="flex flex-col">
                            <span className="font-bold dark:text-white">BAUST Meal</span>
                            <span className="text-xs text-gray-500">Hall Management System</span>
                        </div>
                    </div>
                    <div className="text-center md:text-right space-y-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                            Bangladesh Army University of Science and Technology
                        </p>
                        <p className="text-gray-400 text-xs">
                            &copy; {new Date().getFullYear()} All rights reserved. Developed for BAUST.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

