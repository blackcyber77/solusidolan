<?php

use App\Models\Itinerary;
use Livewire\Volt\Component;
use Livewire\Attributes\Layout;

new #[Layout('layouts.app')] class extends Component
{
    public function with(): array
    {
        return [
            'itineraries' => Itinerary::withCount('stops')->latest()->get(),
        ];
    }

    public function delete(Itinerary $itinerary)
    {
        $itinerary->delete();
        $this->js('alert("Itinerary berhasil dihapus!")');
    }
};
?>
<div>
    <div class="flex items-center justify-between mb-6">
        <flux:heading size="xl" level="1">Itinerary</flux:heading>
        <flux:button href="{{ route('admin.itineraries.create') }}" variant="primary">Buat Baru</flux:button>
    </div>

    <div class="bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table class="w-full text-left text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <tr>
                    <th class="px-6 py-3 font-medium">Judul</th>
                    <th class="px-6 py-3 font-medium">Status</th>
                    <th class="px-6 py-3 font-medium">Pemberhentian</th>
                    <th class="px-6 py-3 font-medium">Diterbitkan Pada</th>
                    <th class="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                @forelse($itineraries as $itinerary)
                    <tr>
                        <td class="px-6 py-4 font-medium text-zinc-900 dark:text-white">{{ $itinerary->title }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/20">
                                {{ ucfirst($itinerary->status) }}
                            </span>
                        </td>
                        <td class="px-6 py-4">{{ $itinerary->stops_count }}</td>
                        <td class="px-6 py-4">{{ $itinerary->published_at?->format('d M Y') ?? '-' }}</td>
                        <td class="px-6 py-4 text-right space-x-2">
                            <flux:button href="{{ route('admin.itineraries.edit', $itinerary) }}" size="sm" variant="subtle">Edit</flux:button>
                            <flux:button wire:click="delete({{ $itinerary->id }})" wire:confirm="Apakah Anda yakin ingin menghapus itinerary ini?" size="sm" variant="danger">Hapus</flux:button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-zinc-500">
                            Tidak ada itinerary yang ditemukan.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>