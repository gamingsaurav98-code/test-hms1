<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffCheckoutRule extends Model
{
     protected $fillable = [
        'staff_id',
        'is_active',
        'active_after_days',
        'percentage',
    ];
}
