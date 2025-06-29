<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffSalaryGenerate extends Model
{
    protected $fillable = [
        'staff_id',
        'salary_amount',
        'year',
        'month',
        'payment_date',
        'payment_type',
        'remark',
    ];
}
