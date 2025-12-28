<?php

namespace App\Models;

use App\Traits\StudentHasNepaliHeart;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use StudentHasNepaliHeart;

    protected $fillable = [
        'invoice_number',
        'student_id',
        'amount',
        'billing_month_bs',
        'billing_year_bs',
        'nepali_date',
        'status',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
