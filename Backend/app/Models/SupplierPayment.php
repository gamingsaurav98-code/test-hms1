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
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
    public function paymentType()
    {
        return $this->belongsTo(PaymentType::class);
    }

}
