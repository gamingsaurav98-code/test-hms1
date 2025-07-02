<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFeeType extends Model
{
    protected $fillable = [
        'fee_type',
        'amount',
        'is_active'
    ];
    public function studentFeeGenerates()
    {
        return $this->hasMany('App\Models\StudentFeeGenerate', 'fee_type');
    }
    public function studentFeeTypes()
    {
        return $this->hasMany('App\Models\StudentFeeType', 'fee_type');
    }
}
