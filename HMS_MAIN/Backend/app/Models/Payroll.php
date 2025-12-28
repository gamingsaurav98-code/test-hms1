<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\StaffHasNepaliHeart;

class Payroll extends Model
{
    use StaffHasNepaliHeart;

    protected $fillable = [
        'payroll_number',
        'staff_id',
        'basic_salary',
        'billing_month_bs',
        'billing_year_bs',
        'nepali_date',
        'status',
        'payment_date',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'nepali_date' => 'date',
    ];

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
