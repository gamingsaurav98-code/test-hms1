<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Hostel;
use App\Models\Block;
use App\Models\Student;
use App\Models\InquirySeater;
use App\Models\Attachment;

class Room extends Model
{
    protected $fillable = [
        'room_name',
        'block_id',
        'hostel_id',
        'capacity',
        'status',
        'room_type',
        'floor_number',
        'room_attachment',
    ];
    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }
    
    public function block()
    {
        return $this->belongsTo(Block::class);
    }
    
    // Floor relationship removed as requested
    
    public function students()
    {
        return $this->hasMany(Student::class);
    }
    
    public function inquirySeaters()
    {
        return $this->hasMany(InquirySeater::class);
    }
    
    // Seater relationship removed as requested - capacity field is used instead
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
