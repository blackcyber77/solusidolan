<x-layout title="{{ $itinerary->title }} - Travel Itinerary">
    <!-- Itinerary Hero -->
    <header class="relative w-full h-[70vh] flex items-end justify-center overflow-hidden pb-16">
        <img src="{{ $itinerary->cover_image ?? 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2000&auto=format&fit=crop' }}" alt="{{ $itinerary->title }}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div class="relative z-10 text-center text-white px-4 max-w-4xl">
            <div class="flex justify-center gap-2 mb-4">
                @if(is_array($itinerary->category))
                    @foreach($itinerary->category as $cat)
                        <span class="bg-terracotta text-sm px-3 py-1 rounded-full uppercase tracking-widest text-xs font-semibold">{{ $cat }}</span>
                    @endforeach
                @endif
            </div>
            <h1 class="font-serif text-4xl md:text-6xl font-bold mb-4 tracking-wide leading-tight">{{ $itinerary->title }}</h1>
            <p class="font-sans text-lg text-gray-200">{{ $itinerary->short_description }}</p>
        </div>
    </header>

    <!-- Itinerary Content (Photo Essay) -->
    <article class="bg-cream">
        
        @foreach($itinerary->stops as $index => $stop)
            <!-- Stop -->
            <section class="w-full flex flex-col {{ $index % 2 == 1 ? 'md:flex-row-reverse' : 'md:flex-row' }} items-center py-16 md:py-32">
                <div class="w-full md:w-1/2 h-[50vh] md:h-[80vh]">
                    <img src="{{ $stop->photo ?? 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?q=80&w=1500&auto=format&fit=crop' }}" alt="{{ $stop->name }}" class="w-full h-full object-cover">
                </div>
                <div class="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center {{ $index % 2 == 1 ? 'text-left md:text-right' : '' }}">
                    <div class="text-terracotta font-serif text-6xl mb-4 opacity-30">{{ sprintf('%02d', $stop->order) }}</div>
                    <h2 class="font-serif text-3xl md:text-4xl font-semibold mb-4 text-gray-900">{{ $stop->name }}</h2>
                    <p class="font-sans text-lg text-gray-600 leading-relaxed">
                        {{ $stop->short_caption }}
                    </p>
                </div>
            </section>

            @if($stop->accommodation)
                <!-- Accommodation Recommendation -->
                <section class="max-w-3xl mx-auto px-4 py-8">
                    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col md:flex-row items-stretch">
                        <div class="w-full md:w-2/5 aspect-[4/3] md:aspect-auto">
                            <img src="{{ $stop->accommodation->photo ?? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop' }}" alt="{{ $stop->accommodation->name }}" class="w-full h-full object-cover">
                        </div>
                        <div class="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                            <div class="text-xs font-bold text-terracotta tracking-widest uppercase mb-2">Tempat Menginap</div>
                            <h3 class="font-serif text-2xl font-medium text-gray-900 mb-3">{{ $stop->accommodation->name }}</h3>
                            <p class="font-sans text-sm text-gray-600 mb-6">{{ $stop->accommodation->short_highlight_text }}</p>
                            <div class="flex flex-col sm:flex-row gap-3">
                                @if($stop->accommodation->whatsapp_link)
                                <a href="{{ $stop->accommodation->whatsapp_link }}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">
                                    Tanya di WhatsApp
                                </a>
                                @endif
                                @if($stop->accommodation->promo_code)
                                <div class="inline-flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                    <span class="text-xs text-gray-500 mr-2">Kode Promo:</span>
                                    <span class="font-mono font-bold text-terracotta">{{ $stop->accommodation->promo_code }}</span>
                                </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </section>
            @endif
        @endforeach

        <!-- Back Link -->
        <div class="text-center py-16 border-t border-gray-200">
            <a href="/" class="inline-flex items-center text-terracotta hover:text-terracotta-dark font-sans font-medium transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Kembali ke Beranda
            </a>
        </div>

    </article>
</x-layout>
