import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('pagina-estudiante')
export class PaginaEstudiante extends LitElement {
    @property()
    name?: string = 'pagina-estudiante';

    createRenderRoot() {
        return this; // Usa Light DOM en vez de Shadow DOM
    }

    render(): TemplateResult {
        return html`
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap"
            rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap"
            rel="stylesheet" />
            <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
            rel="stylesheet" />

            <div class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <div class="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
                <div class="layout-container flex h-full grow flex-col">
                <!-- Navigation Bar -->
                <header
                    class="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 py-4 lg:px-20 bg-white dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
                    <div class="flex items-center gap-8">
                    <div class="flex items-center gap-3 text-primary">
                        <div class="size-8 flex items-center justify-center rounded-lg bg-primary text-white">
                        <span class="material-symbols-outlined">auto_stories</span>
                        </div>
                        <h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">
                        EduTutor</h2>
                    </div>
                    <nav class="hidden md:flex items-center gap-8">
                        <a class="text-primary text-sm font-semibold leading-normal" href="#">Dashboard</a>
                        <a class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href="#">Mis Sesiones</a>
                        <a class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href="#">Tutores</a>
                        <a class="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        href="#">Recursos</a>
                    </nav>
                    </div>
                    <div class="flex flex-1 justify-end gap-6 items-center">
                    <label class="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
                        <div
                        class="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <div class="text-slate-400 flex items-center justify-center pl-3">
                            <span class="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            class="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-400"
                            placeholder="Buscar tutoría..." value="" />
                        </div>
                    </label>
                    <div class="flex items-center gap-4">
                        <button class="relative text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined">notifications</span>
                        <span
                            class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-background-dark"></span>
                        </button>
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20"
                        data-alt="Student profile picture showing a young adult"
                        style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAC80M6UwL1NUH1_5juIVQLfR9fPd3CkyolwB38Ei6VdIus8eiT3HuexckaN27RBeIQ_K7rc-bSiYMx3MBzCixCvTccP1qS3n9c_jwImKlfYGZ0YQoCwsk6GoqYvko6WEKd8X-08ycEBXkfqpb_i6uYrAUuNTJGdxtRmE6xEN5viyqeNxXMaw5hjbBBUPWvmmQ1npWdG667h23LOzzLnROGO9c0Uqg718yPD2ovb30B-Fbp_UORXrzP1jBXuGgyuzPZDPPDy5nSkpc");'>
                        </div>
                    </div>
                    </div>
                </header>
                <main class="flex-1 px-6 lg:px-20 py-8">
                    <div class="max-w-6xl mx-auto flex flex-col gap-8">
                    <!-- Welcome Header -->
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div class="flex flex-col gap-1">
                        <h1 class="text-slate-900 dark:text-slate-100 text-3xl font-black tracking-tight">¡Hola de nuevo,
                            Alex!</h1>
                        <p class="text-slate-500 dark:text-slate-400 text-base">Tienes 2 sesiones programadas para hoy.
                        </p>
                        </div>
                        <button
                        class="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold">
                        <span class="material-symbols-outlined">add_circle</span>
                        <span>Inscribirse a Tutoría</span>
                        </button>
                    </div>
                    <!-- Grid Layout for Content -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Main Content: Active Sessions -->
                        <div class="lg:col-span-2 flex flex-col gap-6">
                        <h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold">Sesiones Activas</h2>
                        <!-- Session Card 1 (Upcoming) -->
                        <div
                            class="group flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                            <div class="flex flex-col justify-between gap-4 flex-1">
                            <div class="flex flex-col gap-2">
                                <div
                                class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold w-fit uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm">schedule</span>
                                En 30 minutos
                                </div>
                                <p class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">Matemáticas
                                Avanzadas: Cálculo Multivariable</p>
                                <div class="flex flex-col text-slate-500 dark:text-slate-400 text-sm">
                                <span class="flex items-center gap-1"><span
                                    class="material-symbols-outlined text-base">person</span> Dr. Smith • Mentor
                                    Senior</span>
                                <span class="flex items-center gap-1"><span
                                    class="material-symbols-outlined text-base">calendar_today</span> Hoy, 4:00 PM
                                    (1h)</span>
                                </div>
                            </div>
                            <button
                                class="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white font-semibold w-fit text-sm">
                                <span class="material-symbols-outlined text-xl">videocam</span>
                                Unirse a Sesión
                            </button>
                            </div>
                            <div class="w-full md:w-48 bg-center bg-no-repeat aspect-video md:aspect-square bg-cover rounded-lg"
                            data-alt="Blackboard with complex mathematical equations"
                            style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDc4PqVsL4fUAx8B3btf-hWA0artFYkHYFZc1rJgjxKRYYpjr5tuTn9aVCAoo6FqNwSvAJ-IbLLggeIETur9IuWUM4f_S07Dh-fIlKteVxbGfJD00Jtx1zp7UEnP88PBrylcVI8dJK74_DZuWDUEefqD4xF9yoD9wzGLRmU0tstjRsYrhUUnbRbnNEGbXU0swZiOWo5rlm4IAF002eqPqVewRAW8Ks2_-kyoO8vLfFOxcyOt5ywhx-PTbDw8yLxu-GjiPZpYQ_GdKU");'>
                            </div>
                        </div>
                        <!-- Session Card 2 -->
                        <div
                            class="group flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                            <div class="flex flex-col justify-between gap-4 flex-1">
                            <div class="flex flex-col gap-2">
                                <div
                                class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold w-fit uppercase tracking-wider">
                                Programada
                                </div>
                                <p class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">Introducción a
                                Python y Data Science</p>
                                <div class="flex flex-col text-slate-500 dark:text-slate-400 text-sm">
                                <span class="flex items-center gap-1"><span
                                    class="material-symbols-outlined text-base">person</span> Ing. Maria Garcia</span>
                                <span class="flex items-center gap-1"><span
                                    class="material-symbols-outlined text-base">calendar_today</span> Hoy, 6:30 PM
                                    (1.5h)</span>
                                </div>
                            </div>
                            <button
                                class="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold w-fit text-sm">
                                <span class="material-symbols-outlined text-xl">info</span>
                                Ver Detalles
                            </button>
                            </div>
                            <div class="w-full md:w-48 bg-center bg-no-repeat aspect-video md:aspect-square bg-cover rounded-lg"
                            data-alt="Laptop screen showing python computer code"
                            style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGQKxvVrZZVRWmgoUzQ3wUIx84TkCT72qgZYf1LHk_YFZxYtFXTbJfKhG8kGSPADNSsOsDoKxFkZSFQVfg4LwEMjaGl1wsPL7UUiLBXuvPrBLC4ju4PAyFg0fWnX2Ot6uxmTVWgdHpfycPErza3xwaZbHekBh-1yJrYUJ8kMI8uM0vhiQXmONuDVUxbqIJFv-6bZy85ciTdq49uytREr5SvFghKjUABAEHIPsmoVOcmZsgrHcZcNRGyqAhg84OBd_GQvAzgjLA-GE");'>
                            </div>
                        </div>
                        </div>
                        <!-- Sidebar: History & Stats -->
                        <div class="flex flex-col gap-8">
                        <!-- Stats Panel -->
                        <div class="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20">
                            <h3 class="text-slate-900 dark:text-slate-100 font-bold mb-4">Progreso del Mes</h3>
                            <div class="flex flex-col gap-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-slate-600 dark:text-slate-400 font-medium">Horas
                                completadas</span>
                                <span class="text-sm font-bold text-primary">12 / 20 hrs</span>
                            </div>
                            <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                                <div class="bg-primary h-2 rounded-full" style="width: 60%"></div>
                            </div>
                            <p class="text-xs text-slate-500 mt-1">¡Estás a solo 8 horas de cumplir tu meta mensual!</p>
                            </div>
                        </div>
                        <!-- Past Sessions History -->
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center justify-between">
                            <h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold">Historial</h2>
                            <a class="text-primary text-xs font-bold uppercase hover:underline" href="#">Ver todo</a>
                            </div>
                            <div class="flex flex-col gap-3">
                            <!-- History Item 1 -->
                            <div
                                class="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div
                                class="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                <span class="material-symbols-outlined text-lg">check_circle</span>
                                </div>
                                <div class="flex-1 overflow-hidden">
                                <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">Física Cuántica I
                                </p>
                                <p class="text-xs text-slate-500">12 Oct • Completado</p>
                                </div>
                                <button class="text-slate-400 hover:text-primary transition-colors">
                                <span class="material-symbols-outlined">download</span>
                                </button>
                            </div>
                            <!-- History Item 2 -->
                            <div
                                class="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div
                                class="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                <span class="material-symbols-outlined text-lg">check_circle</span>
                                </div>
                                <div class="flex-1 overflow-hidden">
                                <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">Escritura
                                    Académica</p>
                                <p class="text-xs text-slate-500">10 Oct • Completado</p>
                                </div>
                                <button class="text-slate-400 hover:text-primary transition-colors">
                                <span class="material-symbols-outlined">download</span>
                                </button>
                            </div>
                            <!-- History Item 3 -->
                            <div
                                class="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div
                                class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <span class="material-symbols-outlined text-lg">cancel</span>
                                </div>
                                <div class="flex-1 overflow-hidden">
                                <p class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">Química Orgánica
                                </p>
                                <p class="text-xs text-slate-500">08 Oct • Cancelado</p>
                                </div>
                            </div>
                            </div>
                        </div>
                        <!-- Status Update Card -->
                        <div class="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden group">
                            <div class="relative z-10">
                            <h4 class="font-bold text-lg mb-2">Nuevo Recurso</h4>
                            <p class="text-slate-400 text-sm mb-4">Guía completa de preparación para exámenes finales ya
                                disponible.</p>
                            <button
                                class="text-white bg-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight">Acceder
                                ahora</button>
                            </div>
                            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined !text-9xl">auto_awesome</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </main>
                <!-- Bottom Mobile Bar -->
                <div
                    class="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 flex justify-around py-4 z-50">
                    <button class="flex flex-col items-center gap-1 text-primary">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span class="text-[10px] font-bold">Inicio</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 text-slate-400">
                    <span class="material-symbols-outlined">calendar_month</span>
                    <span class="text-[10px] font-bold">Sesiones</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 text-slate-400">
                    <span class="material-symbols-outlined">person_search</span>
                    <span class="text-[10px] font-bold">Tutores</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 text-slate-400">
                    <span class="material-symbols-outlined">settings</span>
                    <span class="text-[10px] font-bold">Perfil</span>
                    </button>
                </div>
                </div>
            </div>
            </div>
            `;
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'pagina-estudiante': PaginaEstudiante;
    }
}