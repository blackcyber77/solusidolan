<?php

use App\Models\Itinerary;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $itineraries = Itinerary::where('status', 'published')->latest()->get();

    return view('welcome', compact('itineraries'));
})->name('home');

use Livewire\Volt\Volt;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('dashboard', 'dashboard')->name('dashboard');

    Volt::route('/admin/itineraries', 'admin.itinerary.index')->name('admin.itineraries.index');
    Volt::route('/admin/itineraries/create', 'admin.itinerary.create')->name('admin.itineraries.create');
    Volt::route('/admin/itineraries/{itinerary}/edit', 'admin.itinerary.edit')->name('admin.itineraries.edit');
    Volt::route('/admin/stops/{stop}/edit', 'admin.itinerary.stops.edit')->name('admin.stops.edit');
});

Route::get('/itinerary/{slug}', function ($slug) {
    $itinerary = Itinerary::with(['stops' => function ($q) {
        $q->orderBy('order')->with('accommodation');
    }])->where('status', 'published')->where('slug', $slug)->firstOrFail();

    return view('itinerary', compact('itinerary'));
})->name('itinerary.show');

require __DIR__.'/settings.php';
