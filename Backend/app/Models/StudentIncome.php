<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentIncome extends Model
{
    protected $fillable = [
        'student_id',
        'amount',
        'income_type_id',
        'payment_date',
        'payment_type',
        'remark',
    ];
}
