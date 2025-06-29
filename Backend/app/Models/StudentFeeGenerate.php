<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFeeGenerate extends Model
{
    protected $fillable = [
        'student_id',
        'fee_type',
        'amount',
        'year',
        'month',
    ];

    
}
