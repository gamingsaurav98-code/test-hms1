<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Block;
use App\Models\InquirySeater;
use App\Models\Attachment;

class Inquiry extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'block_id',
        'seater',
        'description',
    ];
    public function block()
    {
        return $this->belongsTo(Block::class);
    }
    
    public function inquirySeaters()
    {
        return $this->hasMany(InquirySeater::class);
    }
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}
