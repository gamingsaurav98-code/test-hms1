<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFeeType extends Model
{
    protected $fillable = [
        'fee_type',
        'amount',
        'is_active'
    ];
    
   
}
