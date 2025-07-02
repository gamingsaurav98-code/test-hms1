<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Share;
use App\Models\ShareTransaction;
use App\Models\ShareHolderFinance;

class ShareHolder extends Model
{
    protected $fillable =[
        'name',
        'email',
        'phone',
        'address',
        'father_name',
        'grandfather_name',
        'spouse_name',
        'share_percentage',
        'investment_amount',
        'shareholder_image_attachment',
        'joined_date',
        'remark',
        'is_active',
    ];
    public function shares()
    {
        return $this->hasMany(Share::class, 'shareholder_id');
    }
    public function shareTransactions()
    {
        return $this->hasMany(ShareTransaction::class, 'shareholder_id');
    }
    public function finances()
    {
        return $this->hasMany(ShareHolderFinance::class, 'shareholder_id');
    }
}
