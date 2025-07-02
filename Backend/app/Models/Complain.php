<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Complain extends Model
{
    protected $fillable = [
        'student_id',
        'staff_id',
        'title',
        'complain_attachment',
        'description',
        'status',
    ];

    public function student()
    
    {
        return $this->belongsTo('App\Models\Student', 'student_id');
    }

    public function staff()
    {
        return $this->belongsTo('App\Models\Staff', 'staff_id');
    }
}
