<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCheckoutRule extends Model
{
    protected $fillable = [
        'student_id',
        'is_active',
        'active_after_days',
        'percentage',
    ];
    public function student()
    {
        return $this->belongsTo('App\Models\Student', 'student_id');
    }
    public function studentCheckoutFinancials()
    {
        return $this->hasMany('App\Models\StudentCheckoutFinancial', 'checkout_rule_id');
    }
    public function studentCheckInCheckOuts()
    {
        return $this->hasMany('App\Models\StudentCheckInCheckOut', 'checkout_rule_id');
    }
}
