<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierPayment extends Model
{
    protected $fillable = [
        'supplier_id',
        'payment_date',
        'description',
        'amount',
        'payment_type_id',
    ];

}
