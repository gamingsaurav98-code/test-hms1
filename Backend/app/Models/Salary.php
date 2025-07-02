<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Staff;
use App\Models\Attachment;

class Salary extends Model
{
    protected $fillable = [
        'staff_id',
        'amount',
        'month',
        'year',
        'status',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
