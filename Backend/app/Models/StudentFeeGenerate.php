<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFeeGenerate extends Model
{
    protected $fillable = [
        'student_id',
        'fee_type',
        'amount',
        'year',
        'month',
    ];
    public function student()
    {
        return $this->belongsTo('App\Models\Student', 'student_id');
    }
    public function feeType()
    {
        return $this->belongsTo('App\Models\FeeType', 'fee_type');
    }
    

}
