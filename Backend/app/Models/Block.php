<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Room;
use App\Models\Floor;
use App\Models\StaffCheckInCheckOut;
use App\Models\Inquiry;
use App\Models\InquirySeater;

class Block extends Model
{
    protected $fillable = [
        'block_name',
        'location',
        'manager_name',
        'manager_contact',
        'remarks',
        'block_attachment',
    ];
    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
    
    public function floors()
    {
        return $this->hasMany(Floor::class);
    }
    
    public function staffCheckInCheckOuts()
    {
        return $this->hasMany(StaffCheckInCheckOut::class);
    }
    
    public function inquiries()
    {
        return $this->hasMany(Inquiry::class);
    }
    
    public function inquirySeaters()
    {
        return $this->hasMany(InquirySeater::class);
    }
}
