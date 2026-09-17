<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItineraryStop extends Model
{
    protected $fillable = [
        'itinerary_id',
        'order',
        'name',
        'photo',
        'short_caption',
    ];

    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }

    public function accommodation()
    {
        return $this->hasOne(AccommodationRecommendation::class);
    }
}
