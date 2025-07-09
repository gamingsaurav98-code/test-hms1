<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Block;
use App\Models\InquirySeater;
use App\Models\Attachment;

class Inquiry extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'seater_type'
    ];

    protected $casts = [
        'seater_type' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Always include timestamps in JSON
    protected $visible = [
        'id',
        'name',
        'email',
        'phone',
        'seater_type',
        'created_at',
        'updated_at'
    ];

    /**
     * Get the human-readable seater type
     */
    public function getSeaterTypeTextAttribute()
    {
        return match($this->seater_type) {
            1 => 'Single Seater',
            2 => 'Double Seater',
            3 => 'Triple Seater',
            4 => 'Four Seater',
            default => $this->seater_type . ' Seater'
        };
    }
}
