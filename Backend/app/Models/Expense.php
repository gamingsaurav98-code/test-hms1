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
        'student_id',
        'staff_id',
        'supplier_id',
        'expense_attachment',
        'payment_type_id',
        'paid_amount',
        'due_amount',
    ];
}
