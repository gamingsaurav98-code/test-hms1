<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'expense_category_id',
        'expense_type',
        'amount',
        'expense_date',
        'title',
        'description',
        'staff_id',
        'supplier_id',
        'expense_attachment',
        'payment_type_id',
        'paid_amount',
        'due_amount',
    ];

    public function expenseCategory()
    {
        return $this->belongsTo('App\Models\ExpenseCategory', 'expense_category_id');
    }
    
    public function staff()
    {
        return $this->belongsTo('App\Models\Staff', 'staff_id');
    }
    public function supplier()
    {
        return $this->belongsTo('App\Models\Supplier', 'supplier_id');
    }
    public function paymentType()
    {
        return $this->belongsTo('App\Models\PaymentType', 'payment_type_id');
    }
}
