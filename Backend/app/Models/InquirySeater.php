<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InquirySeater extends Model
{
    protected $fillable = [
        'room_id',
        'inquiry_id',
        'capacity'
    ];
    public function inquiry()
    {
        return $this->belongsTo('App\Models\Inquiry', 'inquiry_id');
    }
    public function room()
    {
        return $this->belongsTo('App\Models\Room', 'room_id');
    }
    public function seater()
    {
        return $this->hasMany('App\Models\Seater', 'inquiry_seater_id');
    }
    public function block()
    {
        return $this->belongsTo('App\Models\Block', 'block_id');
    }
}
