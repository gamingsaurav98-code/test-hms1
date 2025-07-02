<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        return $this->belongsTo('App\Models\Block', 'block_id');
    }
}
