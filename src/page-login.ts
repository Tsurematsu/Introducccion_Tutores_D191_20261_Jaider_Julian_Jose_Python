import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('page-login')
export class PageLogin extends LitElement {
  @property()
  name?: string = 'page-login';

  
    createRenderRoot() {
        return this; // Usa Light DOM en vez de Shadow DOM
    }

  render(): TemplateResult {
    return html`
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap"
                rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap"
                rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
                rel="stylesheet" />
            <title>EduTutor - Professional Login</title>
            <div
                class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center relative overflow-hidden">
                <!-- Decorative Background Elements -->
                <div class="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
                    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
                    <div class="absolute inset-0" data-alt="Subtle geometric pattern background for education theme"
                        style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCIQ_75JbevKpJ9BC4Tm5pXV-wX-f1c7WzVJKr3296yCtHRiMAXv0_xfWqRpFFyfkubGy6uE3VAlmK1bq_CII8ek3tTbNguzLp1CEi8nDs2KHH02ppz0_tl73FAvm6cbgw_l6v7u0yi41-KFrsapSFDrFWr8ztWEX35EU8GAAhBprBgQD7icfT67YihaLFZ7wqhEQ9Xf77hSU1GH6Vv4J2oBnlrGIeIwa0Vn5nGjgRleFjE5_2GuKmiesYoWYcc1P9jRhVPRgJpwM4');">
                    </div>
                </div>
                <!-- Main Container -->
                <div class="relative z-10 w-full max-w-md px-6 py-12">
                    <div
                        class="bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <!-- Logo Section -->
                        <div class="pt-10 pb-6 flex flex-col items-center">
                            <div class="flex items-center gap-3 text-primary mb-2">
                                <div class="p-2 bg-primary/10 rounded-lg">
                                    <span class="material-symbols-outlined text-3xl font-bold">school</span>
                                </div>
                                <h1 class="text-2xl font-black tracking-tight">EduTutor</h1>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Welcome back! Please login to your
                                account.</p>
                        </div>
                        <!-- Role Selector -->
                        <div class="px-8 pb-4">
                            <div class="flex h-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                <label
                                    class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold transition-all">
                                    <span class="truncate">Student</span>
                                    <input checked="" class="hidden" name="user_role" type="radio" value="Student" />
                                </label>
                                <label
                                    class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold transition-all">
                                    <span class="truncate">Tutor</span>
                                    <input class="hidden" name="user_role" type="radio" value="Tutor" />
                                </label>
                            </div>
                        </div>
                        <!-- Form Section -->
                        <form class="px-8 pb-10 pt-4 space-y-5">
                            <div class="space-y-1.5">
                                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                                <div class="relative">
                                    <span
                                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                    <input
                                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="name@example.com" type="email" />
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <div class="flex justify-between items-center ml-1">
                                    <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                    <a class="text-xs font-bold text-primary hover:underline" href="#">Forgot Password?</a>
                                </div>
                                <div class="relative">
                                    <span
                                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="••••••••" type="password" />
                                </div>
                            </div>
                            <div class="flex items-center gap-2 px-1">
                                <input
                                    class="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                                    id="remember" type="checkbox" />
                                <label class="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none"
                                    for="remember">Remember me for 30 days</label>
                            </div>
                            <button
                                class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                type="submit">
                                <span>Log In to Dashboard</span>
                                <span class="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                            <div class="relative flex py-2 items-center">
                                <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                <span class="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-widest">Or
                                    continue with</span>
                                <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <button
                                    class="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    type="button">
                                    <svg class="w-5 h-5" viewbox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"></path>
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"></path>
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"></path>
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"></path>
                                    </svg>
                                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
                                </button>
                                <button
                                    class="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    type="button">
                                    <svg class="w-5 h-5 fill-current text-slate-900 dark:text-white" viewbox="0 0 24 24">
                                        <path
                                            d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.152-1.11-1.459-1.11-1.459-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z">
                                        </path>
                                    </svg>
                                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">GitHub</span>
                                </button>
                            </div>
                        </form>
                        <div
                            class="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 border-t border-slate-200 dark:border-slate-800 text-center">
                            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Don't have an account?
                                <a class="text-primary font-bold hover:underline ml-1" href="#">Sign up for free</a>
                            </p>
                        </div>
                    </div>
                    <!-- Footer Links -->
                    <div class="mt-8 flex justify-center gap-6">
                        <a class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors" href="#">Privacy
                            Policy</a>
                        <a class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors" href="#">Terms of
                            Service</a>
                        <a class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors" href="#">Help
                            Center</a>
                    </div>
                </div>
            </div>
        
        `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'page-login': PageLogin;
  }
}