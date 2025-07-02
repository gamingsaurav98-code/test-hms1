<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCheckInCheckOut extends Model
{
    protected $fillable = [
        'student_id',
        'requested_checkin_time',
        'requested_checkout_time',
        'checkin_time',
        'checkout_time',
        'checkout_duration',
        'date',
        'remarks',
        'status',
    ];
    public function student()
    {
        return $this->belongsTo('App\Models\Student', 'student_id');
    }
    public function block()
    {
        return $this->belongsTo('App\Models\Block', 'block_id');
    }
}
