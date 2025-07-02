<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffCheckoutRule extends Model
{
     protected $fillable = [
        'staff_id',
        'is_active',
        'active_after_days',
        'percentage',
    ];
    public function staff()
    {
        return $this->belongsTo('App\Models\Staff', 'staff_id');
    }
    public function staffCheckoutFinancials()
    {
        return $this->hasMany('App\Models\StaffCheckoutFinancial', 'checkout_rule_id');
    }
    public function staffCheckInCheckOuts()
    {
        return $this->hasMany('App\Models\StaffCheckInCheckOut', 'checkout_rule_id');
    }
    public function staffCheckoutRuleLogs()
    {
        return $this->hasMany('App\Models\StaffCheckoutRuleLog', 'checkout_rule_id');
    }
    public function staffCheckoutRuleFinancials()
    {
        return $this->hasMany('App\Models\StaffCheckoutRuleFinancial', 'checkout_rule_id');
    }
}
