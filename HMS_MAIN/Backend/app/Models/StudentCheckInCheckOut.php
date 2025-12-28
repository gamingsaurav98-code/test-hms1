<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Student;
use App\Models\Block;
use App\Models\CheckoutRule;
use App\Models\StudentCheckoutFinancial;

class StudentCheckInCheckOut extends Model
{
    protected $fillable = [
        'student_id',
        'requested_checkin_time',
        'requested_checkout_time',
        'checkin_time',
        'checkout_time',
        'estimated_checkin_date',
        'checkout_duration',
        'date',
        'remarks',
        'status',
        'checkout_rule_id',
        'block_id',
        'deduction_amount',
        'rule_applied',
        'adjusted_fee'
    ];

    protected $casts = [
        'deduction_amount' => 'decimal:2',
        'adjusted_fee' => 'decimal:2',
        'checkout_duration' => 'integer',
    ];
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
    public function block()
    {
        return $this->belongsTo(Block::class);
    }
    
    public function checkoutRule()
    {
        return $this->belongsTo(CheckoutRule::class);
    }
    
    public function checkoutFinancials()
    {
        return $this->hasMany(StudentCheckoutFinancial::class, 'checkout_id');
    }
}
