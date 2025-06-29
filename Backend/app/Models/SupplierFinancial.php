<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierFinancial extends Model
{
    protected $fillable = [
        'supplier_id',
        'initial_balance',
        'payment_date',
        'remark',
        'payment_type_id',
    ];
}
