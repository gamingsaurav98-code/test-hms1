<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'room_name',
        'block_id',
        'capacity',
        'status',
        'room_type',
        'floor_number',
        'room_attachment',
    ];
    public function block()
    {
        return $this->belongsTo('App\Models\Block', 'block_id');
    }
    public function inquiries()
    {
        return $this->hasMany('App\Models\Inquiry', 'room_id');
    }
    public function inquirySeaters()
    {
        return $this->hasMany('App\Models\InquirySeater', 'room_id');
    }
    public function seater()
    {
        return $this->hasMany('App\Models\Seater', 'room_id');
    }
}
