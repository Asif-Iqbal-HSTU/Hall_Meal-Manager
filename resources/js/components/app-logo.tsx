import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-emerald-600 text-white">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-emerald-900 dark:text-emerald-100 uppercase tracking-tighter">
                    BAUST <span className="text-amber-600 dark:text-amber-400">Meal</span>
                </span>
            </div>
        </>
    );
}
