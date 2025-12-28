<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Student;
use App\Models\StudentCheckoutFinancial;
use App\Models\StudentCheckInCheckOut;

class CheckoutRule extends Model
{
    protected $table = 'checkout_rules';

    protected $fillable = [
        'user_type',
        'user_id',
        'is_active',
        'active_after_days',
        'percentage',
        'name',
        'description',
        'deduction_type',
        'deduction_value',
        'min_days',
        'max_days',
        'priority'
    ];

    protected $casts = [
        'deduction_value' => 'decimal:2',
        'is_active' => 'boolean',
        'min_days' => 'integer',
        'max_days' => 'integer',
        'priority' => 'integer',
        'percentage' => 'integer',
        'active_after_days' => 'integer',
    ];
    public function user()
    {
        return $this->morphTo();
    }
    
    public function checkoutFinancials()
    {
        return $this->hasMany(StudentCheckoutFinancial::class, 'checkout_rule_id');
    }
    
    public function checkInCheckOuts()
    {
        return $this->hasMany(StudentCheckInCheckOut::class, 'checkout_rule_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
