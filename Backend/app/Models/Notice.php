<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    protected $fillable = [
        'title',
        'description',
        'notice_attachment', // e.g., file path or URL
        'schedule_time',
        'status', // e.g., active, inactive
        'target_type',
        'notice_type', // e.g., general, urgent, event
        'student_id',
        'staff_id',
    ];
}
