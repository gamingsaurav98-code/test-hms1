<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Hostel;
use App\Models\Room;
use App\Models\StudentCheckInCheckOut;
use App\Models\StudentFinancial;
use App\Models\StudentCheckoutFinancial;
use App\Models\StudentCheckoutRule;
use App\Models\Notice;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Complain;
use App\Models\StudentFeeGenerate;
use App\Models\StudentAmenities;
use App\Models\Attachment;

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
        'hostel_id',
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
    
    public function hostel()
    {
        return $this->belongsTo(Hostel::class);
    }
    
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
    
    // Payment relationship removed as requested
    
    public function checkInCheckOuts()
    {
        return $this->hasMany(StudentCheckInCheckOut::class);
    }
    
    public function financials()
    {
        return $this->hasMany(StudentFinancial::class);
    }
    
    public function checkoutFinancials()
    {
        return $this->hasMany(StudentCheckoutFinancial::class);
    }
    
    public function checkoutRules()
    {
        return $this->hasMany(StudentCheckoutRule::class);
    }
    
    public function notices()
    {
        return $this->hasMany(Notice::class);
    }
    
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
    
    public function incomes()
    {
        return $this->hasMany(Income::class);
    }
    
    public function complains()
    {
        return $this->hasMany(Complain::class);
    }
    
    public function feeGenerates()
    {
        return $this->hasMany(StudentFeeGenerate::class);
    }
    
    public function amenities()
    {
        return $this->hasMany(StudentAmenities::class);
    }
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}