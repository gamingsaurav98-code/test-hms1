<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Payment extends Model
{
    protected $fillable = [
        'student_id',
        'staff_id',
        'admin_id',
        'amount',
        'payment_type',
        'description',
        'status',
        'transaction_id',
        'paid_at',
        'notes',
        'payable_type',
        'payable_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the student that made the payment
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the staff member associated with the payment
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get the admin who processed/authorized the payment
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the payable model (StudentFinancial, SalaryPayment, etc.)
     */
    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to filter payments by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter payments by payment type
     */
    public function scopeByPaymentType($query, $type)
    {
        return $query->where('payment_type', $type);
    }

    /**
     * Scope to filter payments within a date range
     */
    public function scopeWithinDateRange($query, $from, $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }

    /**
     * Mark payment as completed
     */
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'paid_at' => now(),
        ]);
    }

    /**
     * Mark payment as failed
     */
    public function markAsFailed()
    {
        $this->update([
            'status' => 'failed',
        ]);
    }

    /**
     * Mark payment as pending
     */
    public function markAsPending()
    {
        $this->update([
            'status' => 'pending',
        ]);
    }
}
