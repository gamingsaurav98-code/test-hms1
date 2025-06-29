<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'expense_category',
        'expense_type',
        'amount',
        'expense_date',
        'title',
        'description',
        'student_id',
        'staff_id',
        'supplier_id',
        'expense_attachment',
        'payment_method',
        'paid_amount',
        'due_amount',
    ];
}
