<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffCheckoutFinancial extends Model
{
    protected $fillable = [
        'staff_id',
        'checkout_id',
        'checkout_duration',
        'deducted_amount'
    ];
}
