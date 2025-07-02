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

    public function floors()
    {
        return $this->hasMany('App\Models\Floor', 'hostel_id');
    }
    public function blocks()
    {
        return $this->hasMany('App\Models\Block', 'hostel_id');
    }
    public function expenses()
    {
        return $this->hasMany('App\Models\Expense', 'hostel_id');
    }
    public function students()
    {
        return $this->hasMany('App\Models\Student', 'hostel_id');
    }
    public function staff()
    {
        return $this->hasMany('App\Models\Staff', 'hostel_id');
    }
    public function complaints()
    {
        return $this->hasMany('App\Models\Complain', 'hostel_id');
    }
    public function expenseCategories()
    {
        return $this->hasMany('App\Models\ExpenseCategory', 'hostel_id');
    }
    public function payments()
    {
        return $this->hasMany('App\Models\Payment', 'hostel_id');
    }
    public function paymentTypes()
    {
        return $this->hasMany('App\Models\PaymentType', 'hostel_id');
    }
    public function suppliers()
    {
        return $this->hasMany('App\Models\Supplier', 'hostel_id');
    }
    public function rooms()
    {
        return $this->hasMany('App\Models\Room', 'hostel_id');
    }
    public function roomTypes()
    {
        return $this->hasMany('App\Models\RoomType', 'hostel_id');
    }
    
}
