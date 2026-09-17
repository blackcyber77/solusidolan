<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccommodationRecommendation extends Model
{
    protected $fillable = [
        'itinerary_stop_id',
        'name',
        'photo',
        'short_highlight_text',
        'whatsapp_link',
        'promo_code',
        'redirect_url',
    ];

    public function stop()
    {
        return $this->belongsTo(ItineraryStop::class, 'itinerary_stop_id');
    }
}
