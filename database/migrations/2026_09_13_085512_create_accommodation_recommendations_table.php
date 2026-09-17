<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('accommodation_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_stop_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('photo')->nullable();
            $table->text('short_highlight_text')->nullable();
            $table->string('whatsapp_link')->nullable();
            $table->string('promo_code')->nullable();
            $table->string('redirect_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodation_recommendations');
    }
};
