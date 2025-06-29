<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hostel extends Model
{
    protected $fillable = [
        'name',
        'address',
        'email',
        'phone',
        'logo',
        'owner_name',
        'contact_person',
        'capacity',
        'pan_number',
    ];
}
