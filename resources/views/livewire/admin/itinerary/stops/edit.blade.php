<?php

use App\Models\ItineraryStop;
use App\Models\AccommodationRecommendation;
use Livewire\Volt\Component;
use Livewire\Attributes\Layout;

new #[Layout('layouts.app')] class extends Component
{
    public ItineraryStop $stop;
    
    // Stop Form
    public string $name = '';
    public int $order = 1;
    public string $photo = '';
    public string $short_caption = '';

    // Accommodation Form
    public string $acc_name = '';
    public string $acc_photo = '';
    public string $acc_highlight = '';
    public string $acc_wa = '';
    public string $acc_promo = '';
    public string $acc_url = '';

    public function mount(ItineraryStop $stop)
    {
        $this->stop = $stop;
        
        $this->name = $stop->name;
        $this->order = $stop->order;
        $this->photo = $stop->photo ?? '';
        $this->short_caption = $stop->short_caption ?? '';

        $acc = $stop->accommodation;
        if ($acc) {
            $this->acc_name = $acc->name;
            $this->acc_photo = $acc->photo ?? '';
            $this->acc_highlight = $acc->short_highlight_text ?? '';
            $this->acc_wa = $acc->whatsapp_link ?? '';
            $this->acc_promo = $acc->promo_code ?? '';
            $this->acc_url = $acc->redirect_url ?? '';
        }
    }

    public function save()
    {
        $this->validate([
            'name' => 'required',
            'order' => 'required|integer',
            'photo' => 'nullable|url',
            'short_caption' => 'nullable',
            
            'acc_name' => 'nullable',
            'acc_photo' => 'nullable|url',
            'acc_wa' => 'nullable|url',
            'acc_url' => 'nullable|url',
        ]);

        // Update stop
        $this->stop->update([
            'name' => $this->name,
            'order' => $this->order,
            'photo' => $this->photo,
            'short_caption' => $this->short_caption,
        ]);

        // Update or create accommodation
        if (!empty($this->acc_name)) {
            $this->stop->accommodation()->updateOrCreate(
                ['itinerary_stop_id' => $this->stop->id],
                [
                    'name' => $this->acc_name,
                    'photo' => $this->acc_photo,
                    'short_highlight_text' => $this->acc_highlight,
                    'whatsapp_link' => $this->acc_wa,
                    'promo_code' => $this->acc_promo,
                    'redirect_url' => $this->acc_url,
                ]
            );
        } elseif ($this->stop->accommodation) {
            // Delete if name is cleared
            $this->stop->accommodation->delete();
        }

        $this->js('alert("Pemberhentian berhasil diperbarui!")');
    }
};
?>
<div>
    <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <flux:button href="{{ route('admin.itineraries.edit', $stop->itinerary_id) }}" variant="subtle" icon="arrow-left" class="!px-2" aria-label="Kembali"></flux:button>
            <flux:heading size="xl" level="1">Edit Pemberhentian</flux:heading>
        </div>
    </div>

    <form wire:submit="save" class="max-w-4xl mx-auto space-y-8">
        
        <!-- Stop Detail -->
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
            <h2 class="text-lg font-semibold border-b pb-2 mb-4 dark:border-zinc-800">Detail Pemberhentian</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="md:col-span-1">
                    <flux:input wire:model="order" type="number" label="Urutan" required />
                </div>
                <div class="md:col-span-3">
                    <flux:input wire:model="name" label="Nama Lokasi" required />
                </div>
            </div>
            
            <flux:input wire:model="photo" label="URL Foto" />
            
            <flux:textarea wire:model="short_caption" label="Keterangan / Cerita" rows="4" />
        </div>

        <!-- Accommodation -->
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
            <h2 class="text-lg font-semibold border-b pb-2 mb-4 dark:border-zinc-800">Rekomendasi Akomodasi (Opsional)</h2>
            
            <flux:input wire:model="acc_name" label="Nama Hotel / Penginapan" placeholder="Kosongkan untuk menghapus rekomendasi akomodasi" />
            
            <flux:input wire:model="acc_photo" label="URL Foto Akomodasi" />
            
            <flux:textarea wire:model="acc_highlight" label="Teks Sorotan (Kelebihan Hotel)" rows="2" />
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <flux:input wire:model="acc_wa" label="Tautan WhatsApp" placeholder="https://wa.me/..." />
                <flux:input wire:model="acc_promo" label="Kode Promo" />
                <flux:input wire:model="acc_url" label="Tautan (URL) Pemesanan" />
            </div>
        </div>

        <div class="pt-4 flex justify-end">
            <flux:button type="submit" variant="primary">Simpan Pemberhentian & Akomodasi</flux:button>
        </div>
    </form>
</div>