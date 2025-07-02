<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Room;
use App\Models\Payment;
use App\Models\StudentCheckInCheckOut;
use App\Models\StudentFinancial;
use App\Models\StudentCheckoutFinancial;
use App\Models\StudentCheckoutRule;

class Student extends Model
{
    protected $fillable = 
        [   
        'student_name',
        'user_id',
        'date_of_birth',
        'contact_number',
        'email',
        'district',
        'city_name',
        'ward_no',
        'street_name',
        'citizenship_no',
        'date_of_issue',
        'citizenship_issued_district',
        'educational_institution',
        'class_time',
        'level_of_study',
        'expected_stay_duration',
        'blood_group',
        'food',
        'disease',
        'father_name',
        'father_contact',
        'father_occupation',
        'mother_name',
        'mother_contact',
        'mother_occupation',
        'spouse_name',
        'spouse_contact',
        'spouse_occupation',
        'local_guardian_name',
        'local_guardian_address',
        'local_guardian_contact',
        'local_guardian_occupation',
        'local_guardian_relation',
        'verified_by',
        'verified_on',
        'student_id',
        'room_id',
        'student_image',
        'student_citizenship_image',
        'registration_form_image',
        'is_active',
        'is_existing_student',
        ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    public function checkInCheckOuts()
    {
        return $this->hasMany('App\Models\StudentCheckInCheckOut', 'student_id');
    }
    public function studentFinancials()
    {
        return $this->hasMany('App\Models\StudentFinancial', 'student_id');
    }
    public function studentCheckoutFinancials()
    {
        return $this->hasMany('App\Models\StudentCheckoutFinancial', 'student_id');
    }
    public function studentSalaryGenerates()
    {
        return $this->hasMany('App\Models\StudentSalaryGenerate', 'student_id');
    }
    public function studentCheckoutRules()
    {
        return $this->hasMany('App\Models\StudentCheckoutRule', 'student_id');
    }
}