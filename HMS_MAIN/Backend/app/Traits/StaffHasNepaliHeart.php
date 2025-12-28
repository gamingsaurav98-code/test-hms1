<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait StaffHasNepaliHeart
{
    protected static function bootHasNepaliHeart(): void
    {
        static::creating(function ($model) {
            $model->populateNepaliFields();
        });
    }

    protected function populateNepaliFields(): void
    {
        $currentBs = $this->getCurrentBsDate();

        $this->billing_month_bs = $currentBs['month'];
        $this->billing_year_bs = $currentBs['year'];
        $this->nepali_date = $currentBs['full_date'];
    }

    protected function getCurrentBsDate(): array
    {
        return Cache::remember('current_bs_date', 86400, function () { // 24 hours TTL
            $nepaliDate = new \Nilambar\NepaliDate\NepaliDate();
            $current = $nepaliDate->getDetails(date('Y'), date('m'), date('d'), 'ad');

            return [
                'month' => (int) $current['n'], // numeric month
                'year' => (int) $current['Y'],  // 4-digit year
                'full_date' => $current['Y'] . '-' . $current['m'] . '-' . $current['d'],
                'ad_date' => date('Y-m-d')
            ];
        });
    }
}