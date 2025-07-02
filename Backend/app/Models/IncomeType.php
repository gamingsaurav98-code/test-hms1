<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncomeType extends Model
{
    protected $fillable =[
        'title',
        'amount',
        'student_id',
    ];
    public function student()
    {
        return $this->belongsTo('App\Models\Student', 'student_id');
    }
    public function income()
    {
        return $this->hasMany('App\Models\Income', 'income_type_id');
    }
    
}
