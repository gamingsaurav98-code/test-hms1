<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCheckoutFinancial extends Model
{
    protected $fillable = [
        'student_id',
        'checkout_id',
        'checkout_duration',
        'deducted_amount'
    ];
}
