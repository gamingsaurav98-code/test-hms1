<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Room;
use App\Models\Hostel;
use App\Models\StaffCheckInCheckOut;
use App\Models\StudentCheckInCheckOut;
use App\Models\Inquiry;
use App\Models\InquirySeater;
use App\Models\Attachment;

class Block extends Model
{
    protected $fillable = [
        'hostel_id',
        'block_name',
        'location',
        'manager_name',
        'manager_contact',
        'remarks',
        'block_attachment',
    ];

    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }
    
    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
    
    // Floor relationship removed as requested
    
    public function staffCheckInCheckOuts()
    {
        return $this->hasMany(StaffCheckInCheckOut::class);
    }
    
    public function studentCheckInCheckOuts()
    {
        return $this->hasMany(StudentCheckInCheckOut::class);
    }
    
    public function inquiries()
    {
        return $this->hasMany(Inquiry::class);
    }
    
    public function inquirySeaters()
    {
        return $this->hasMany(InquirySeater::class);
    }
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
