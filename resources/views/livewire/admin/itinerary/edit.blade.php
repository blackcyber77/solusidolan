<?php

use App\Models\Itinerary;
use App\Models\ItineraryStop;
use Illuminate\Support\Str;
use Livewire\Volt\Component;
use Livewire\Attributes\Layout;

new #[Layout('layouts.app')] class extends Component
{
    public Itinerary $itinerary;
    
    public string $title = '';
    public string $short_description = '';
    public string $cover_image = '';
    public string $status = 'draft';
    public array $category = [];

    public function mount(Itinerary $itinerary)
    {
        $this->itinerary = $itinerary;
        $this->title = $itinerary->title;
        $this->short_description = $itinerary->short_description ?? '';
        $this->cover_image = $itinerary->cover_image ?? '';
        $this->status = $itinerary->status;
        $this->category = $itinerary->category ?? [];
    }

    public function rules()
    {
        return [
            'title' => 'required|min:3',
            'short_description' => 'nullable',
            'cover_image' => 'nullable|url',
            'status' => 'required|in:draft,published',
            'category' => 'nullable|array',
        ];
    }

    public function save()
    {
        $this->validate();

        $this->itinerary->update([
            'title' => $this->title,
            'short_description' => $this->short_description,
            'cover_image' => $this->cover_image,
            'status' => $this->status,
            'category' => $this->category,
            'published_at' => $this->status === 'published' && !$this->itinerary->published_at ? now() : $this->itinerary->published_at,
        ]);

        $this->js('alert("Itinerary berhasil diperbarui!")');
    }

    public function createStop()
    {
        $stop = $this->itinerary->stops()->create([
            'name' => 'Pemberhentian Baru',
            'order' => $this->itinerary->stops()->count() + 1,
        ]);
        
        return redirect()->route('admin.stops.edit', $stop);
    }
    
    public function deleteStop(ItineraryStop $stop)
    {
        $stop->delete();
        $this->itinerary->load('stops');
    }
};
?>
<div>
    <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <flux:button href="{{ route('admin.itineraries.index') }}" variant="subtle" icon="arrow-left" class="!px-2" aria-label="Kembali"></flux:button>
            <flux:heading size="xl" level="1">Edit Itinerary</flux:heading>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Edit Form -->
        <div class="lg:col-span-2 space-y-8">
            <form wire:submit="save" class="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
                
                <flux:input wire:model="title" label="Judul" required />
                
                <flux:textarea wire:model="short_description" label="Deskripsi Singkat" rows="3" />
                
                <flux:input wire:model="cover_image" label="URL Gambar Sampul" />
                
                <flux:select wire:model="status" label="Status">
                    <flux:select.option value="draft">Draf</flux:select.option>
                    <flux:select.option value="published">Diterbitkan</flux:select.option>
                </flux:select>

                <flux:checkbox.group wire:model="category" label="Kategori">
                    <flux:checkbox value="Budaya" label="Budaya" />
                    <flux:checkbox value="Kuliner" label="Kuliner" />
                    <flux:checkbox value="Alam" label="Alam" />
                    <flux:checkbox value="1 Hari" label="1 Hari" />
                    <flux:checkbox value="Weekend Trip" label="Weekend Trip" />
                </flux:checkbox.group>

                <div class="pt-4 flex justify-end">
                    <flux:button type="submit" variant="primary">Simpan Perubahan</flux:button>
                </div>
            </form>
        </div>

        <!-- Stops Management -->
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-zinc-900 dark:text-white">Daftar Pemberhentian (Stops)</h3>
                    <flux:button wire:click="createStop" size="sm" icon="plus">Tambah Stop</flux:button>
                </div>
                
                <div class="space-y-3">
                    @forelse($itinerary->stops as $stop)
                        <div class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
                            <div class="flex items-center gap-3 truncate">
                                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400">{{ $stop->order }}</span>
                                <span class="font-medium text-sm truncate">{{ $stop->name }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <flux:button href="{{ route('admin.stops.edit', $stop) }}" size="sm" variant="subtle" class="!px-2">Edit</flux:button>
                                <flux:button wire:click="deleteStop({{ $stop->id }})" wire:confirm="Hapus pemberhentian ini?" size="sm" variant="danger" class="!px-2">Hapus</flux:button>
                            </div>
                        </div>
                    @empty
                        <p class="text-sm text-zinc-500 text-center py-4">Belum ada pemberhentian yang ditambahkan.</p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>