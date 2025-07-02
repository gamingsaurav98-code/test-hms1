<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Room;
use App\Models\Inquiry;
use App\Models\Block;

class InquirySeater extends Model
{
    protected $fillable = [
        'room_id',
        'inquiry_id',
        'capacity'
    ];
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
    
    public function inquiry()
    {
        return $this->belongsTo(Inquiry::class);
    }
    
    public function block()
    {
        return $this->belongsTo(Block::class);
    }
    
    // Seater relationship removed as requested - capacity field is used instead
}
