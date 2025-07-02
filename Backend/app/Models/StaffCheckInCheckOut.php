<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffCheckInCheckOut extends Model
{
    protected $fillable = [
        'staff_id',
        'requested_checkin_time',
        'requested_checkout_time',
        'checkin_time',
        'checkout_time',
        'date',
        'block_id',
        'remarks',
        'status',
    ];
    public function staff()
    {
        return $this->belongsTo('App\Models\Staff', 'staff_id');
    }
    public function block()
    {
        return $this->belongsTo('App\Models\Block', 'block_id');
    }
}
