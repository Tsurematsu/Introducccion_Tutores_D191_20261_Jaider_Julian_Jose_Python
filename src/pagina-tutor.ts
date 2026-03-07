import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import "./index.css"
@customElement('pagina-tutor')
export class PaginaTutor extends LitElement {
    @property()
    name?: string = 'pagina-tutor';

    createRenderRoot() {
        return this; // Usa Light DOM en vez de Shadow DOM
    }

    render(): TemplateResult {
        return html`
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
            rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
            rel="stylesheet" />

        <title>TutorPro Dashboard</title>
        </head>

        <div class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
                <div class="layout-container flex h-full grow flex-col">
                    <!-- Top Navigation Bar -->
                    <header
                        class="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 lg:px-10">
                        <div class="flex items-center gap-8">
                            <div class="flex items-center gap-2 text-primary">
                                <span class="material-symbols-outlined text-3xl font-bold">school</span>
                                <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                                    TutorPro</h2>
                            </div>
                            <nav class="hidden md:flex items-center gap-6">
                                <a class="text-primary text-sm font-semibold border-b-2 border-primary pb-1"
                                    href="#">Dashboard</a>
                                <a class="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
                                    href="#">My Sessions</a>
                                <a class="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
                                    href="#">Students</a>
                                <a class="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
                                    href="#">Earnings</a>
                            </nav>
                        </div>
                        <div class="flex flex-1 justify-end gap-4 items-center">
                            <label class="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
                                <div class="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
                                    <div class="text-slate-500 flex items-center justify-center pl-4">
                                        <span class="material-symbols-outlined text-xl">search</span>
                                    </div>
                                    <input
                                        class="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-500 px-3"
                                        placeholder="Search sessions..." />
                                </div>
                            </label>
                            <button
                                class="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                                <span class="material-symbols-outlined">notifications</span>
                            </button>
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 border-2 border-primary/20"
                                data-alt="Professional male tutor profile picture"
                                style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkGIBxj2BvtQv4afmuavgbFx3h88UxudwHTKxRjqe2L6c15X8h8wXIR5sVV9YAGDUsBJ_YCtt_zkPiv6ezngLsCRRUvmLGcDjdbvlrm-75qap3JzOf660ibxBb0XaHWbiQ0dJj8HtDFjr0QKFi8h2g2AAc6Vdbsp1cCHBg0V_lEcoafDTHpRp8CGgzEiMex-x5yd9lM2hk-FQHjEiV-G-7UcvOj60NDixn6dyP39Stp3Y9YzFWKL5M6-Gx8fmAEOv3DWMOSEnx5lI");'>
                            </div>
                        </div>
                    </header>
                    <main class="flex-1 flex flex-col lg:flex-row">
                        <!-- Sidebar -->
                        <aside
                            class="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-8">
                            <div class="flex flex-col gap-4">
                                <div class="flex items-center gap-3">
                                    <div class="bg-primary/10 p-2 rounded-lg text-primary">
                                        <span class="material-symbols-outlined">account_circle</span>
                                    </div>
                                    <div class="flex flex-col">
                                        <h1 class="text-slate-900 dark:text-white text-sm font-bold">Alex Johnson</h1>
                                        <p class="text-slate-500 text-xs">Premium Math Tutor</p>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1 mt-4">
                                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-white font-medium"
                                        href="#">
                                        <span class="material-symbols-outlined text-xl">grid_view</span>
                                        <span class="text-sm">Overview</span>
                                    </a>
                                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        href="#">
                                        <span class="material-symbols-outlined text-xl">calendar_today</span>
                                        <span class="text-sm">Schedule</span>
                                    </a>
                                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        href="#">
                                        <span class="material-symbols-outlined text-xl">history</span>
                                        <span class="text-sm">Session History</span>
                                    </a>
                                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        href="#">
                                        <span class="material-symbols-outlined text-xl">mail</span>
                                        <span class="text-sm">Messages</span>
                                    </a>
                                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        href="#">
                                        <span class="material-symbols-outlined text-xl">settings</span>
                                        <span class="text-sm">Settings</span>
                                    </a>
                                </div>
                            </div>
                            <div class="mt-auto bg-primary/5 rounded-xl p-4 border border-primary/10">
                                <p class="text-xs text-primary font-bold uppercase tracking-wider mb-2">Weekly Goal</p>
                                <div class="flex justify-between items-end mb-1">
                                    <span class="text-2xl font-bold text-slate-900 dark:text-white">12/20</span>
                                    <span class="text-xs text-slate-500">Hours</span>
                                </div>
                                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                    <div class="bg-primary h-1.5 rounded-full" style="width: 60%"></div>
                                </div>
                            </div>
                        </aside>
                        <!-- Content Area -->
                        <div class="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
                            <!-- Stats Section -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div
                                    class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div class="flex items-center justify-between mb-4">
                                        <p class="text-slate-500 text-sm font-medium">Completed Sessions</p>
                                        <span
                                            class="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full">+12%</span>
                                    </div>
                                    <p class="text-3xl font-bold text-slate-900 dark:text-white">142</p>
                                </div>
                                <div
                                    class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div class="flex items-center justify-between mb-4">
                                        <p class="text-slate-500 text-sm font-medium">Total Earnings</p>
                                        <span class="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">This
                                            month</span>
                                    </div>
                                    <p class="text-3xl font-bold text-slate-900 dark:text-white">$2,450.00</p>
                                </div>
                                <div
                                    class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div class="flex items-center justify-between mb-4">
                                        <p class="text-slate-500 text-sm font-medium">Student Rating</p>
                                        <div class="flex items-center text-amber-500">
                                            <span class="material-symbols-outlined text-sm fill-1">star</span>
                                            <span class="text-xs font-bold ml-1">Top Rated</span>
                                        </div>
                                    </div>
                                    <p class="text-3xl font-bold text-slate-900 dark:text-white">4.98/5</p>
                                </div>
                            </div>
                            <!-- Main Sections: Assignments & Upcoming -->
                            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                <!-- Left: Assignments List -->
                                <div class="xl:col-span-2 space-y-6">
                                    <div class="flex items-center justify-between">
                                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Recent Assignments</h3>
                                        <button class="text-primary text-sm font-semibold hover:underline">View all</button>
                                    </div>
                                    <div
                                        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                        <div class="overflow-x-auto">
                                            <table class="w-full text-left">
                                                <thead
                                                    class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                                    <tr>
                                                        <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student
                                                        </th>
                                                        <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject
                                                        </th>
                                                        <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                                                            Date/Time</th>
                                                        <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status
                                                        </th>
                                                        <th
                                                            class="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">
                                                            Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                                    <!-- Pending Assignment -->
                                                    <tr
                                                        class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td class="px-6 py-4">
                                                            <div class="flex items-center gap-3">
                                                                <div class="h-8 w-8 rounded-full bg-slate-200"
                                                                    data-alt="Student profile avatar for Liam"
                                                                    style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOfp6HAknqjjDyiAswonf0OTogmFEPnOZcU48h9F7UbHxS2USiuTAp6kTkWTC2-rdWOek4dU35Vb8zl1N4kzsHhqC9wamL5cVsft7vYtSzwmrX6vkaDAjNsPj0BquVpgXwV2WKl4iaBsbH64c828CWzQczFgmgaTB5gfYUZUNWzYSaP41Emi_6_Yxdkhcqk1n0rH4diOqtN8PvR5GFosalOrE1HP9LBDwwfOt40ZB56NhfiPPTluaT6UBzuG92pvYvVwC5SL9zqKs'); background-size: cover;">
                                                                </div>
                                                                <span class="text-sm font-semibold">Liam Smith</span>
                                                            </div>
                                                        </td>
                                                        <td class="px-6 py-4 text-sm">Calculus I</td>
                                                        <td class="px-6 py-4 text-sm text-slate-500">Oct 24, 4:00 PM</td>
                                                        <td class="px-6 py-4">
                                                            <span
                                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>
                                                        </td>
                                                        <td class="px-6 py-4 text-right">
                                                            <div class="flex justify-end gap-2">
                                                                <button
                                                                    class="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-lg transition-colors"
                                                                    title="Accept">
                                                                    <span class="material-symbols-outlined text-lg">check</span>
                                                                </button>
                                                                <button
                                                                    class="bg-slate-100 dark:bg-slate-800 hover:bg-red-100 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                                                                    title="Reject">
                                                                    <span class="material-symbols-outlined text-lg">close</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <!-- Accepted Assignment -->
                                                    <tr
                                                        class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td class="px-6 py-4">
                                                            <div class="flex items-center gap-3">
                                                                <div class="h-8 w-8 rounded-full bg-slate-200"
                                                                    data-alt="Student profile avatar for Emma"
                                                                    style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqP2flUCh4ry54fJPllFwtvUCIT_w80VsiRGdKhTByY1BYSwKF1LIlMxSWxUa7M-67vTQvarXKKzQQa0NopopaCokeEEhr8bfkFCtU8Ya-aENolinl4Bkx3A7hLIZ7WES-WeXg3M-HoTt1fvbABxVO1vuDhF3o5_zW-mhhN4Q7kCv0ghlxhVfYkNmC1UIUZMme6mIKZAmqK82CPEzLYkpJ3MATOq9XhQinnJcP6UQ0LciQJTdAsXpf9EHzhFROiLndwByp-cSzkwE'); background-size: cover;">
                                                                </div>
                                                                <span class="text-sm font-semibold">Emma Wilson</span>
                                                            </div>
                                                        </td>
                                                        <td class="px-6 py-4 text-sm">Advanced Physics</td>
                                                        <td class="px-6 py-4 text-sm text-slate-500">Oct 25, 10:00 AM</td>
                                                        <td class="px-6 py-4">
                                                            <span
                                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Accepted</span>
                                                        </td>
                                                        <td class="px-6 py-4 text-right text-slate-400 italic text-xs">Awaiting
                                                            session</td>
                                                    </tr>
                                                    <!-- Completed Assignment -->
                                                    <tr
                                                        class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td class="px-6 py-4">
                                                            <div class="flex items-center gap-3">
                                                                <div class="h-8 w-8 rounded-full bg-slate-200"
                                                                    data-alt="Student profile avatar for Noah"
                                                                    style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC_kMOt7_YySC0iItEZlEBt8Sl3WIOlsXi_lINSOQL3wEZ6M0ibQcSskFcunU-3WWu4rWrJwJrWgbjRXd0x-9bEF0dMagIyVMpewpHghO13ZbByR6zBrQ9ZZqWLIKdVZrHUsyc24yseTwaYIy9QeBTgm6Dscgg8hsshvoPLLHHMyS90DhukNHUUZX0VdyWTPkqiDNFuL78BGXt89m567y-k6ceI15Q8rX77u4ikd5HD_IKDd0gYtDlO5jUbT9d0srzOU5KpbbKEsks'); background-size: cover;">
                                                                </div>
                                                                <span class="text-sm font-semibold">Noah Garcia</span>
                                                            </div>
                                                        </td>
                                                        <td class="px-6 py-4 text-sm">Linear Algebra</td>
                                                        <td class="px-6 py-4 text-sm text-slate-500">Oct 22, 2:00 PM</td>
                                                        <td class="px-6 py-4">
                                                            <span
                                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</span>
                                                        </td>
                                                        <td class="px-6 py-4 text-right">
                                                            <button class="text-primary hover:text-primary/80">
                                                                <span class="material-symbols-outlined">receipt_long</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    <!-- Another Pending -->
                                                    <tr
                                                        class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td class="px-6 py-4">
                                                            <div class="flex items-center gap-3">
                                                                <div class="h-8 w-8 rounded-full bg-slate-200"
                                                                    data-alt="Student profile avatar for Sophia"
                                                                    style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDindE77q2vmQ088206G6USwH4bPzPdoLiQ5OSULQDy30SiR0z5LMqyh7WhrWyvO5RVyuDaHloCFOOhFDlP_55gamu4Q0_SAqK-fkHYe6Ol9jrBAw4TJXHxMDOKV0PfO6MMMdoOQEIWvYqdbaFJwjzlugGXNhwga7UmtoQe1vWteYuDMjTNgAEOq3_W2jgLjPPPhp6lsniTMtJV9CVb1AoDSbwKfwD4_jRXp_DwvGsclc8EzAeQdfUQR71d_UEmokk2SxqRBRo0cfI'); background-size: cover;">
                                                                </div>
                                                                <span class="text-sm font-semibold">Sophia Chen</span>
                                                            </div>
                                                        </td>
                                                        <td class="px-6 py-4 text-sm">Geometry</td>
                                                        <td class="px-6 py-4 text-sm text-slate-500">Oct 26, 3:30 PM</td>
                                                        <td class="px-6 py-4">
                                                            <span
                                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>
                                                        </td>
                                                        <td class="px-6 py-4 text-right">
                                                            <div class="flex justify-end gap-2">
                                                                <button
                                                                    class="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-lg transition-colors">
                                                                    <span class="material-symbols-outlined text-lg">check</span>
                                                                </button>
                                                                <button
                                                                    class="bg-slate-100 dark:bg-slate-800 hover:bg-red-100 hover:text-red-600 p-1.5 rounded-lg transition-colors">
                                                                    <span class="material-symbols-outlined text-lg">close</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <!-- Right: Upcoming Summary -->
                                <div class="space-y-6">
                                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Upcoming Sessions</h3>
                                    <div class="flex flex-col gap-4">
                                        <!-- Upcoming Card 1 -->
                                        <div
                                            class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                                            <div
                                                class="bg-primary/10 text-primary p-3 rounded-xl flex flex-col items-center justify-center min-w-[60px]">
                                                <span class="text-xs font-bold uppercase">Oct</span>
                                                <span class="text-xl font-bold">24</span>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-sm font-bold text-slate-900 dark:text-white">Calculus I Intensive
                                                </p>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span
                                                        class="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                                                    <span class="text-xs text-slate-500">4:00 PM - 5:30 PM</span>
                                                </div>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span
                                                        class="material-symbols-outlined text-slate-400 text-sm">video_call</span>
                                                    <span class="text-xs text-primary font-medium">Join Zoom Meeting</span>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Upcoming Card 2 -->
                                        <div
                                            class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                                            <div
                                                class="bg-slate-100 dark:bg-slate-800 text-slate-500 p-3 rounded-xl flex flex-col items-center justify-center min-w-[60px]">
                                                <span class="text-xs font-bold uppercase">Oct</span>
                                                <span class="text-xl font-bold">25</span>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-sm font-bold text-slate-900 dark:text-white">Quantum Physics Lab
                                                </p>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span
                                                        class="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                                                    <span class="text-xs text-slate-500">10:00 AM - 12:00 PM</span>
                                                </div>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span class="material-symbols-outlined text-slate-400 text-sm">person</span>
                                                    <span class="text-xs text-slate-500">Emma Wilson</span>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Upcoming Card 3 -->
                                        <div
                                            class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                                            <div
                                                class="bg-slate-100 dark:bg-slate-800 text-slate-500 p-3 rounded-xl flex flex-col items-center justify-center min-w-[60px]">
                                                <span class="text-xs font-bold uppercase">Oct</span>
                                                <span class="text-xl font-bold">25</span>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-sm font-bold text-slate-900 dark:text-white">Weekly Review</p>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span
                                                        class="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                                                    <span class="text-xs text-slate-500">3:00 PM - 4:00 PM</span>
                                                </div>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span class="material-symbols-outlined text-slate-400 text-sm">group</span>
                                                    <span class="text-xs text-slate-500">Group Session (4)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        class="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all hover:opacity-90">
                                        Open Full Calendar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    `;
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'pagina-tutor': PaginaTutor;
    }
}