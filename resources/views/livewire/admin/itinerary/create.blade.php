<?php

use App\Models\Itinerary;
use Illuminate\Support\Str;
use Livewire\Volt\Component;
use Livewire\Attributes\Layout;

new #[Layout('layouts.app')] class extends Component
{
    public string $title = '';
    public string $short_description = '';
    public string $cover_image = '';
    public string $status = 'draft';
    public array $category = [];

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

        $itinerary = Itinerary::create([
            'title' => $this->title,
            'slug' => Str::slug($this->title) . '-' . rand(100, 999),
            'short_description' => $this->short_description,
            'cover_image' => $this->cover_image,
            'status' => $this->status,
            'category' => $this->category,
            'published_at' => $this->status === 'published' ? now() : null,
        ]);

        return redirect()->route('admin.itineraries.edit', $itinerary);
    }
};
?>
<div>
    <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <flux:button href="{{ route('admin.itineraries.index') }}" variant="subtle" icon="arrow-left" class="!px-2" aria-label="Kembali"></flux:button>
            <flux:heading size="xl" level="1">Buat Itinerary</flux:heading>
        </div>
    </div>

    <form wire:submit="save" class="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
        
        <flux:input wire:model="title" label="Judul" placeholder="contoh: Pesona Bali 3 Hari" required />
        
        <flux:textarea wire:model="short_description" label="Deskripsi Singkat" placeholder="Penjelasan singkat mengenai itinerary ini..." rows="3" />
        
        <flux:input wire:model="cover_image" label="URL Gambar Sampul" placeholder="https://..." />
        
        <flux:select wire:model="status" label="Status">
            <flux:select.option value="draft">Draf</flux:select.option>
            <flux:select.option value="published">Diterbitkan</flux:select.option>
        </flux:select>

        {{-- Simple Category checkboxes --}}
        <flux:checkbox.group wire:model="category" label="Kategori">
            <flux:checkbox value="Budaya" label="Budaya" />
            <flux:checkbox value="Kuliner" label="Kuliner" />
            <flux:checkbox value="Alam" label="Alam" />
            <flux:checkbox value="1 Hari" label="1 Hari" />
            <flux:checkbox value="Weekend Trip" label="Weekend Trip" />
        </flux:checkbox.group>

        <div class="pt-4 flex justify-end">
            <flux:button type="submit" variant="primary">Simpan & Lanjutkan</flux:button>
        </div>
    </form>
</div>