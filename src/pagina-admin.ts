import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('pagina-admin')
export class PaginaAdmin extends LitElement {
    @property()
    name?: string = 'pagina-admin';


    createRenderRoot() {
        return this; // Usa Light DOM en vez de Shadow DOM
    }


    render(): TemplateResult {
        return html`
    <title>Tutoring Admin Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
        rel="stylesheet" />

    <body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
        <div class="flex h-screen overflow-hidden">
            <!-- Side Navigation Bar -->
            <aside
                class="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div class="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
                    <div class="bg-primary rounded-lg p-2 text-white">
                        <span class="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <div>
                        <h1 class="font-bold text-slate-900 dark:text-white leading-none">Tutoring Admin</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Platform Management</p>
                    </div>
                </div>
                <nav class="flex-1 p-4 flex flex-col gap-2">
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                        href="#">
                        <span class="material-symbols-outlined text-slate-500 group-hover:text-primary">dashboard</span>
                        <span class="text-sm font-medium">Dashboard</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                        href="#">
                        <span class="material-symbols-outlined text-slate-500 group-hover:text-primary">group</span>
                        <span class="text-sm font-medium">Registro de Estudiantes</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg transition-colors"
                        href="#">
                        <span class="material-symbols-outlined">person_pin</span>
                        <span class="text-sm font-semibold">Registro de Tutores</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                        href="#">
                        <span
                            class="material-symbols-outlined text-slate-500 group-hover:text-primary">calendar_month</span>
                        <span class="text-sm font-medium">Scheduling</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                        href="#">
                        <span class="material-symbols-outlined text-slate-500 group-hover:text-primary">payments</span>
                        <span class="text-sm font-medium">Payments</span>
                    </a>
                </nav>
                <div class="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <img alt="Admin Avatar"
                            class="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                            data-alt="Profile picture of the administrator"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuMfBjZzcM4NBDKKeKTOoIwRL9VS9JqjMQfaXioWPmH2A74Lz6eGSDtyYPIU8OraVYKZZa3dopXrz-LiT3SrqTE4eJNskjQiyVJi8koiNDHH14eLXPYa1QLmxQgQtx2k8TqnCVrOWG_fzhj-ydtJSnQRfX8Kkdi9WeMCdXVqxrPjyYw0ibN68C7n_YqKptuBCuH1qBuqUuGqKFWt58Ul-tsAJ9qY6Bx_cioVO5JKtMZrOfQ2piWYJ-0yxG9a7zujxru2IjwKc14YE" />
                        <div class="overflow-hidden">
                            <p class="text-sm font-bold truncate">Alex Morgan</p>
                            <p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>
            <!-- Main Content Area -->
            <main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
                <!-- Header -->
                <header
                    class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div class="flex items-center flex-1 max-w-xl">
                        <div class="relative w-full">
                            <span
                                class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input
                                class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-950 transition-all"
                                placeholder="Search tutors, students, or specialties..." type="text" />
                        </div>
                    </div>
                    <div class="flex items-center gap-4 ml-4">
                        <button
                            class="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                            <span class="material-symbols-outlined">notifications</span>
                            <span
                                class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <button
                            class="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <span class="material-symbols-outlined">settings</span>
                        </button>
                        <div class="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
                        <button
                            class="bg-primary text-white text-sm font-bold px-4 h-10 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            <span class="material-symbols-outlined text-lg">add</span>
                            New Tutor
                        </button>
                    </div>
                </header>
                <div class="p-8 space-y-8">
                    <!-- Page Title -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Registro de
                                Tutores</h2>
                            <p class="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor tutor availability,
                                performance and specialties.</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <span class="material-symbols-outlined text-lg">download</span>
                                Export Data
                            </button>
                        </div>
                    </div>
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div
                                    class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <span class="material-symbols-outlined">person</span>
                                </div>
                                <span class="text-green-500 text-xs font-bold flex items-center">+5.2% <span
                                        class="material-symbols-outlined text-xs">trending_up</span></span>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tutores</p>
                            <p class="text-2xl font-bold mt-1">1,248</p>
                        </div>
                        <div
                            class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div
                                    class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                    <span class="material-symbols-outlined">event_available</span>
                                </div>
                                <span class="text-red-500 text-xs font-bold flex items-center">-2.1% <span
                                        class="material-symbols-outlined text-xs">trending_down</span></span>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Sessions</p>
                            <p class="text-2xl font-bold mt-1">426</p>
                        </div>
                        <div
                            class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div
                                    class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                                    <span class="material-symbols-outlined">pending_actions</span>
                                </div>
                                <span class="text-green-500 text-xs font-bold flex items-center">+12% <span
                                        class="material-symbols-outlined text-xs">trending_up</span></span>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Approvals</p>
                            <p class="text-2xl font-bold mt-1">12</p>
                        </div>
                        <div
                            class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div
                                    class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                                    <span class="material-symbols-outlined">star</span>
                                </div>
                                <span class="text-slate-400 text-xs font-bold">AVG 4.9</span>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Satisfaction</p>
                            <p class="text-2xl font-bold mt-1">98%</p>
                        </div>
                    </div>
                    <!-- Filters -->
                    <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            class="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">All
                            Specialities</button>
                        <button
                            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-colors whitespace-nowrap">Mathematics</button>
                        <button
                            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-colors whitespace-nowrap">Physics
                            &amp; Science</button>
                        <button
                            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-colors whitespace-nowrap">Languages</button>
                        <button
                            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-colors whitespace-nowrap">Computer
                            Science</button>
                        <button
                            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-colors whitespace-nowrap">Literature</button>
                    </div>
                    <!-- Tutors Table -->
                    <div
                        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div
                            class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 class="font-bold text-lg">Tutor Directory</h3>
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-slate-500">Showing 10 of 124 tutors</span>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50 dark:bg-slate-800/50">
                                        <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Tutor Name</th>
                                        <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Specialties</th>
                                        <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Hourly Rate</th>
                                        <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Availability</th>
                                        <th
                                            class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                                            Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                    <!-- Row 1 -->
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <img class="w-full h-full object-cover"
                                                        data-alt="Portrait of Sarah Jenkins, Mathematics Tutor"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6hQp5PrBeTlb-Q4oXiyBF7Wf171h9LTpo2roisyE9gLe5z9oc6v_dR-lhP3HB698abCfL4h1qi22FakqlBI7kERKjuuH3j_2on25POBgBzJVHuHAZ_u_5_e60qlttKzTrKbWTVJD559ZA6xBPMYcDSZBAoJflrzbDg-8_97gqp9bo2KWGMP1GJCRWpXlk906Ize-3iIlGRrwi0POStEm3RxaQZEwiqNrjXSmCiAW3_iKO-SEpuFKCl0FbG5JSDMaABNuGw-BaZxk" />
                                                </div>
                                                <div>
                                                    <p class="font-bold text-sm">Sarah Jenkins</p>
                                                    <p class="text-xs text-slate-500">sarah.j@example.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-wrap gap-1">
                                                <span
                                                    class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Algebra</span>
                                                <span
                                                    class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Calculus</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold">$45/hr</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-1.5">
                                                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span class="text-xs font-medium">Available now</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center justify-center gap-2">
                                                <button
                                                    class="p-2 text-slate-400 hover:text-primary transition-colors"><span
                                                        class="material-symbols-outlined text-lg">edit</span></button>
                                                <button
                                                    class="p-2 text-slate-400 hover:text-red-500 transition-colors"><span
                                                        class="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Row 2 -->
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <img class="w-full h-full object-cover"
                                                        data-alt="Portrait of Michael Chen, Physics Tutor"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0qR9h3HEr_bxb4CBUFsBiG_CzsJZdzV04TBSZm8BnGcGfisNbasE4uhbsdilIVibu8YaeLx1gA5C9VIGQdwhq01a6fau6G_fNvo998W-61lEN60Dk1a1bU5ognJrAvdWQ0gDNNW52kLSgv9ugqa2GmvTt9gpB8RASwcXEUkzPaAFkrdbaBt9tlZNbD52-qdDGdrYwqRhfVs3TFcBQp6xyNJiHTjwPVts3GwP_SISFyIlFsADtbt2VRWnAGnXZxuOb1Ct_uKbkJo0" />
                                                </div>
                                                <div>
                                                    <p class="font-bold text-sm">Michael Chen</p>
                                                    <p class="text-xs text-slate-500">m.chen@example.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-wrap gap-1">
                                                <span
                                                    class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">Physics</span>
                                                <span
                                                    class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">Statics</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold">$55/hr</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-1.5 text-slate-400">
                                                <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                                <span class="text-xs font-medium">Monday, 3 PM</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center justify-center gap-2">
                                                <button
                                                    class="p-2 text-slate-400 hover:text-primary transition-colors"><span
                                                        class="material-symbols-outlined text-lg">edit</span></button>
                                                <button
                                                    class="p-2 text-slate-400 hover:text-red-500 transition-colors"><span
                                                        class="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Row 3 -->
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <img class="w-full h-full object-cover"
                                                        data-alt="Portrait of Elena Rodriguez, Spanish Tutor"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKRWwstowjqK-g82To2bCH38OmU_vwcCZ367GNrnOPvtQ65bbUhKyL3Z06Aqn5frKoVi1XSFWEvnnYKhuPpmwztO0UcpU6qB67pSX6G4rEYAyXGYcqiAqz5MuGEB0CiDPQs4AmqUxqmBB1s3eSywoohZP_tiowM7jDYXgeKrG_SnzDO43TyI4gBF4xNhW3QGfsDHEqn-BmFklr3EwhumCGlvEBhHroKR01BgiADsX9bFH7bSWr-MJQkNdLXnlaPCy3gxgg7nF4uro" />
                                                </div>
                                                <div>
                                                    <p class="font-bold text-sm">Elena Rodriguez</p>
                                                    <p class="text-xs text-slate-500">elena.ro@example.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-wrap gap-1">
                                                <span
                                                    class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold">Spanish</span>
                                                <span
                                                    class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold">Literature</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold">$35/hr</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-1.5">
                                                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span class="text-xs font-medium">Available now</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center justify-center gap-2">
                                                <button
                                                    class="p-2 text-slate-400 hover:text-primary transition-colors"><span
                                                        class="material-symbols-outlined text-lg">edit</span></button>
                                                <button
                                                    class="p-2 text-slate-400 hover:text-red-500 transition-colors"><span
                                                        class="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Row 4 -->
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <img class="w-full h-full object-cover"
                                                        data-alt="Portrait of David Kim, Computer Science Tutor"
                                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw7WAk0QIHqd63KSrwK3ZtkrPlcVoxIdpMYcd2lI1wU1iPm0LtLC5P_kGNx1AmEyTEZtv6OgPLvb8GZ9YsAZhKwv7tz45TTu_-wWY7uqAd4cZ-kanuZ7Xh_5lC49nsDSQ0MwA4HvxQFVNdTfs1moeq_ZPpzjd8IFUQRs7dCwjq6aljes0-fw_P4RbqX2OfSy4blyj4lka-DwuKjqdOqL1OWEWIUZX9t0c_dbehzmyuYnIDfBW2urC2sSdO-Ex-6tcsWUuHzLxfdsQ" />
                                                </div>
                                                <div>
                                                    <p class="font-bold text-sm">David Kim</p>
                                                    <p class="text-xs text-slate-500">d.kim@example.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-wrap gap-1">
                                                <span
                                                    class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold">Python</span>
                                                <span
                                                    class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold">Data
                                                    Structures</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold">$60/hr</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-1.5 text-amber-500">
                                                <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <span class="text-xs font-medium">In a session</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center justify-center gap-2">
                                                <button
                                                    class="p-2 text-slate-400 hover:text-primary transition-colors"><span
                                                        class="material-symbols-outlined text-lg">edit</span></button>
                                                <button
                                                    class="p-2 text-slate-400 hover:text-red-500 transition-colors"><span
                                                        class="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- Pagination -->
                        <div
                            class="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <button
                                class="text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-1 disabled:opacity-50">
                                <span class="material-symbols-outlined">chevron_left</span>
                                Previous
                            </button>
                            <div class="flex items-center gap-1">
                                <button class="w-8 h-8 rounded bg-primary text-white text-xs font-bold">1</button>
                                <button
                                    class="w-8 h-8 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold">2</button>
                                <button
                                    class="w-8 h-8 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold">3</button>
                                <span class="px-1 text-slate-400">...</span>
                                <button
                                    class="w-8 h-8 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold">12</button>
                            </div>
                            <button class="text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-1">
                                Next
                                <span class="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <!-- Recent Activities & Performance -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div
                            class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="font-bold text-lg">Active Session Growth</h3>
                                <select
                                    class="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1 focus:ring-0">
                                    <option>Last 30 Days</option>
                                    <option>Last 6 Months</option>
                                </select>
                            </div>
                            <div class="h-64 flex items-end justify-between gap-2">
                                <!-- Simple CSS bar chart visualization -->
                                <div
                                    class="flex-1 bg-primary/20 hover:bg-primary rounded-t transition-colors relative group h-[40%]">
                                    <span
                                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">120</span>
                                </div>
                                <div
                                    class="flex-1 bg-primary/20 hover:bg-primary rounded-t transition-colors relative group h-[55%]">
                                    <span
                                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">165</span>
                                </div>
                                <div
                                    class="flex-1 bg-primary/20 hover:bg-primary rounded-t transition-colors relative group h-[45%]">
                                    <span
                                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">135</span>
                                </div>
                                <div
                                    class="flex-1 bg-primary/20 hover:bg-primary rounded-t transition-colors relative group h-[70%]">
                                    <span
                                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">210</span>
                                </div>
                                <div
                                    class="flex-1 bg-primary/20 hover:bg-primary rounded-t transition-colors relative group h-[60%]">
                                    <span
                                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">180</span>
                                </div>
                                <div
                                    class="flex-1 bg-primary/20 hover:bg-primary rounded-t transition-colors relative group h-[85%]">
                                    <span
                                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">255</span>
                                </div>
                                <div class="flex-1 bg-primary rounded-t relative group h-[95%]">
                                    <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">285</span>
                                </div>
                            </div>
                            <div
                                class="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>
                        <div
                            class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 class="font-bold text-lg mb-6">Quick Tasks</h3>
                            <div class="space-y-4">
                                <div
                                    class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div
                                        class="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex-shrink-0 mt-0.5 group-hover:border-primary">
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold">Verify 3 new math tutors</p>
                                        <p class="text-xs text-slate-500 mt-0.5">Application deadline today</p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div
                                        class="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex-shrink-0 mt-0.5 group-hover:border-primary">
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold">Update language rates</p>
                                        <p class="text-xs text-slate-500 mt-0.5">Seasonal adjustment needed</p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div
                                        class="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex-shrink-0 mt-0.5 group-hover:border-primary">
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold">Monthly report export</p>
                                        <p class="text-xs text-slate-500 mt-0.5">Sent to finance department</p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div
                                        class="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 flex-shrink-0 mt-0.5 group-hover:border-primary">
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold">System backup</p>
                                        <p class="text-xs text-slate-500 mt-0.5">Scheduled for 12:00 AM</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                class="w-full mt-6 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                + Add Task
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </div>
        `;
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'pagina-admin': PaginaAdmin;
    }
}