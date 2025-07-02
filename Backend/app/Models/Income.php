<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Student;
use App\Models\IncomeType;

class Income extends Model
{
    protected $fillable = [
        'income_type',
        'amount',
        'income_date',
        'title',
        'description',
        'student_id',
        'income_attachment', // e.g., file path or URL
    ];
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
    public function incomeType()
    {
        return $this->belongsTo(IncomeType::class);
    }
    
}
