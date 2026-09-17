<x-layout>
    <!-- Hero Section -->
    <header class="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=2070&auto=format&fit=crop" alt="Bali Landscape" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 text-center text-white px-4">
            <h1 class="font-serif text-5xl md:text-7xl font-bold mb-4 tracking-wide">Jelajahi Indahnya <br/><span class="text-terracotta">Nusantara</span></h1>
            <p class="font-sans text-lg md:text-xl max-w-2xl mx-auto opacity-90">Temukan itinerary perjalanan yang dirancang khusus untuk pengalaman tak terlupakan. Photo-essay perjalanan lokal.</p>
        </div>
    </header>

    <!-- Content Section -->
    <section class="py-16 md:py-24 bg-cream">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <!-- Category Filters -->
            <div class="flex flex-wrap gap-3 mb-12">
                <button class="px-5 py-2 rounded-full border border-terracotta bg-terracotta text-white font-sans text-sm tracking-wide transition">Semua</button>
                <button class="px-5 py-2 rounded-full border border-terracotta/30 text-terracotta hover:bg-terracotta/10 font-sans text-sm tracking-wide transition">Budaya</button>
                <button class="px-5 py-2 rounded-full border border-terracotta/30 text-terracotta hover:bg-terracotta/10 font-sans text-sm tracking-wide transition">Kuliner</button>
                <button class="px-5 py-2 rounded-full border border-terracotta/30 text-terracotta hover:bg-terracotta/10 font-sans text-sm tracking-wide transition">1 Hari</button>
                <button class="px-5 py-2 rounded-full border border-terracotta/30 text-terracotta hover:bg-terracotta/10 font-sans text-sm tracking-wide transition">Weekend Trip</button>
            </div>

            <h2 class="font-serif text-3xl md:text-4xl font-semibold mb-8 text-gray-900">Itinerary Pilihan</h2>
            
            <!-- Horizontal Scroll Cards -->
            <div class="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
                
                @forelse($itineraries as $itinerary)
                    <a href="{{ route('itinerary.show', $itinerary->slug) }}" class="block min-w-[300px] md:min-w-[400px] flex-none snap-start group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                        <div class="aspect-[4/5] overflow-hidden relative">
                            <img src="{{ $itinerary->cover_image ?? 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop' }}" alt="{{ $itinerary->title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div class="absolute bottom-0 left-0 p-6 text-white w-full">
                                <div class="flex gap-2 mb-3">
                                    @if(is_array($itinerary->category))
                                        @foreach($itinerary->category as $cat)
                                            <span class="bg-terracotta/90 text-xs px-2 py-1 rounded backdrop-blur-sm">{{ $cat }}</span>
                                        @endforeach
                                    @endif
                                </div>
                                <h3 class="font-serif text-2xl font-medium mb-1">{{ $itinerary->title }}</h3>
                                <p class="font-sans text-sm text-gray-200 line-clamp-2">{{ $itinerary->short_description }}</p>
                            </div>
                        </div>
                    </a>
                @empty
                    <p class="text-zinc-500">Belum ada itinerary yang dipublikasikan.</p>
                @endforelse

            </div>
        </div>
    </section>
    
    <style>
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</x-layout>
