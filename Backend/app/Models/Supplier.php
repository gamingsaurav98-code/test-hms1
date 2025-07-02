<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Payment;
use App\Models\SupplierFinancial;
use App\Models\SupplierTransaction;
use App\Models\Expense;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'email',
        'contact_number',
        'address',
        'description',
        'pan_number',
    ];
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    public function financials()
    {
        return $this->hasMany(SupplierFinancial::class);
    }

    public function transactions()
    {
        return $this->hasMany(SupplierTransaction::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
