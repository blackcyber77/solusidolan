<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Itinerary extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'cover_image',
        'short_description',
        'category',
        'status',
        'published_at',
    ];

    protected $casts = [
        'category' => 'array',
        'published_at' => 'datetime',
    ];

    public function stops()
    {
        return $this->hasMany(ItineraryStop::class)->orderBy('order');
    }
}
