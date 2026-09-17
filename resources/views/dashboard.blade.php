<x-layouts::app :title="__('Dasbor')">
    <div class="flex h-full w-full flex-1 flex-col gap-6 rounded-xl">
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center py-16">
            <div class="h-16 w-16 bg-terracotta/10 rounded-full flex items-center justify-center mb-4">
                <flux:icon.map class="size-8 text-terracotta" />
            </div>
            <h2 class="text-2xl font-bold font-serif mb-2">Selamat Datang di Admin Panel!</h2>
            <p class="text-zinc-500 mb-6 max-w-md">Backend untuk mengelola Itinerary dan Rekomendasi Akomodasi sudah siap digunakan.</p>
            
            <flux:button href="{{ route('admin.itineraries.index') }}" variant="primary" icon="arrow-right">Kelola Itinerary Sekarang</flux:button>
        </div>
    </div>
</x-layouts::app>
