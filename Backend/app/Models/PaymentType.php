<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentType extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active'
    ];
    public function payments()
    {
        return $this->hasMany('App\Models\Payment', 'payment_type_id');
    }

    public function studentFinancials()
    {
        return $this->hasMany(StudentFinancial::class);
    }

    public function staffFinancials()
    {
        return $this->hasMany(StaffFinancial::class);
    }

    public function salaryPayments()
    {
        return $this->hasMany(SalaryPayment::class);
    }

    public function shareHolderFinances()
    {
        return $this->hasMany(ShareHolderFinance::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function supplierFinancials()
    {
        return $this->hasMany(SupplierFinancial::class);
    }

    public function supplierPayments()
    {
        return $this->hasMany(SupplierPayment::class);
    }

    public function staffSalaryGenerates()
    {
        return $this->hasMany(StaffSalaryGenerate::class);
    }
}
