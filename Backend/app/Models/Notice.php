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
    public function student()
    {
        return $this->belongsTo('App\Models\Student', 'student_id');
    }
    public function staff()
    {
        return $this->belongsTo('App\Models\Staff', 'staff_id');
    }
    public function target()
    {
        return $this->belongsTo('App\Models\Target', 'target_type');
    }
    public function noticeType()
    {
        return $this->belongsTo('App\Models\NoticeType', 'notice_type');
    }
    public function noticeAttachment()
    {
        return $this->hasOne('App\Models\NoticeAttachment', 'notice_id');
    }
}
