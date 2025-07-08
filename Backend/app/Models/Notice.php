<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Block;
use App\Models\Attachment;

class Notice extends Model
{
    protected $fillable = [
        'title',
        'description',
        'notice_attachment', // e.g., file path or URL
        'schedule_time',
        'status', // e.g., active, inactive
        'target_type', // e.g., all, student, staff, specific_student, specific_staff, block
        'notice_type', // e.g., general, urgent, event, announcement
        'student_id',
        'staff_id',
        'block_id',
    ];
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
    
    public function block()
    {
        return $this->belongsTo(Block::class);
    }
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
    
}