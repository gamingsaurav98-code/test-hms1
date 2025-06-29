<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFinancial extends Model
{
    protected $fillable = [
        'student_id',
        'amount',
        'monthly_fee',
        'is_existing_student',
        'previous_balance',
        'initial_balance_after_registration',
        'balance_type', // "due" or "advance"
        'payment_date',
        'remark',
        'payment_type_id',
    ];
}
