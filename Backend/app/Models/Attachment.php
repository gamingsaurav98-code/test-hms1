<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $fillable = [
        'name',
        'path',
        'type',
        'student_id',
        'staff_id',
        'expense_id',
        'inquiry_id',
        'block_id',
        'complain_id',
        'shareholder_id',
        'supplier_id',
        'notice_id',
        'income_id',
        'room_id',
        'salary_id',
        'salary_payment_id',
        'user_id',
        'floor_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
