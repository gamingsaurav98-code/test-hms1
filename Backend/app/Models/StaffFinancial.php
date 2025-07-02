<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffFinancial extends Model
{
    protected $fillable = [
        'staff_id',
        'amount',
        'payment_date',
        'remark',
        'payment_type_id',
    ];
    public function staff()
    {
        return $this->belongsTo('App\Models\Staff', 'staff_id');
    }
}
