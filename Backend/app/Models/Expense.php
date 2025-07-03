<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Hostel;
use App\Models\ExpenseCategory;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Supplier;
use App\Models\PaymentType;
use App\Models\Purchase;
use App\Models\Attachment;

class Expense extends Model
{
    protected $fillable = [
        'hostel_id',
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

    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }

    public function expenseCategory()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }
    
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
    
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
    
    public function paymentType()
    {
        return $this->belongsTo(PaymentType::class);
    }
    
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
