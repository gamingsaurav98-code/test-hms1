<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];
    
    public function expenses()
    {
        return $this->hasMany('App\Models\Expense', 'expense_category_id');
    }
}
