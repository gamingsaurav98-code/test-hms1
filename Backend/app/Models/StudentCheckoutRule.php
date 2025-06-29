<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCheckoutRule extends Model
{
    protected $fillable = [
        'student_id',
        'is_active',
        'active_after_days',
        'percentage',
    ];
}
