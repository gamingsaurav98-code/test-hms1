<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffSalaryGenerate extends Model
{
    protected $fillable = [
        'staff_id',
        'salary_amount',
        'year',
        'month',
        'payment_date',
        'remark',
        'payment_type_id',
    ];
    public function staff()
    {
        return $this->belongsTo('App\Models\Staff', 'staff_id');
    }
    
}
