<?php

namespace App\Services;

use App\Models\CheckInCheckOutRule;
use App\Models\StaffCheckInCheckOut;
use App\Models\Staff;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class StaffCheckoutDeductionService
{
    public function calculateDeduction(StaffCheckInCheckOut $checkout): array
    {
        // Calculate duration from actual times instead of stored duration
        $duration = $this->calculateDurationFromTimes($checkout);
        $monthlyFee = $checkout->staff->salary_amount;
        // Fetch the universal rule set by admin
        $universalRule = Cache::remember(
            "universal_checkout_rule",
            3600,
            function () {
                return CheckInCheckOutRule::whereNull('user_type')
                    ->whereNull('user_id')
                    ->where('is_active', true)
                    ->first();
            }
        );

        // Use only the universal rule
        $ruleForCalculation = $universalRule;

        if (!$universalRule) {
            $adminMessage = 'Universal checkout rule is not set. Please configure the rule in settings.';
            Log::warning('Universal checkout rule missing');
            throw new \Exception($adminMessage);
        }

        // Calculate prorate (duration / 30)
        $prorateRatio = $duration / 30;

        $deductionAmount = 0;

        // Use the selected rule for both deduction type and value (no min/max checks)
        $deductionType = $ruleForCalculation->deduction_type ?? 'percentage';
        $deductionValue = $ruleForCalculation->deduction_value ?? $ruleForCalculation->percentage ?? 0;

        if ($deductionType === 'percentage') {
            // Calculate deduction: (percentage * monthly_fee) * prorate
            $deductionAmount = ($deductionValue / 100 * $monthlyFee) * $prorateRatio;
        } else {
            // Fixed amount deduction
            $deductionAmount = $deductionValue * $prorateRatio;
        }

        // Ensure deduction doesn't exceed monthly fee
        $deductionAmount = min($deductionAmount, $monthlyFee);

        $adjustedFee = $monthlyFee - $deductionAmount;

        $result = [
            'deduction_amount' => round($deductionAmount, 2),
            'adjusted_fee' => round($adjustedFee, 2),
            'rule_applied' => $ruleForCalculation->name ?? $ruleForCalculation->description ?? null,
            'prorate_ratio' => $prorateRatio,
            'rule_id' => $ruleForCalculation->id ?? null,
        ];

        return $result;
    }

    private function calculateDurationFromTimes(StaffCheckInCheckOut $checkout): int
    {
        // Use checkin_time if available, otherwise use estimated_checkin_date
        $endTime = $checkout->checkin_time ?: $checkout->estimated_checkin_date;
        $startTime = $checkout->checkout_time;

        if (!$startTime || !$endTime) {
            // Fallback to stored duration if times are not available
            return $checkout->checkout_duration ?? 0;
        }

        try {
            $start = Carbon::parse($startTime);
            $end = Carbon::parse($endTime);
            
            // Calculate duration in days
            $durationInDays = $start->diffInDays($end);
            
            return $durationInDays;
        } catch (\Exception $e) {
            // Fallback to stored duration if parsing fails
            return $checkout->checkout_duration ?? 0;
        }
    }

    public function applyDeduction(StaffCheckInCheckOut $checkout): bool
    {
        DB::transaction(function () use ($checkout) {
            $calculation = $this->calculateDeduction($checkout);

            $checkout->update([
                'deduction_amount' => $calculation['deduction_amount'],
                'adjusted_amount' => $calculation['adjusted_fee'],
                'rule_applied' => $calculation['rule_applied'],
                'checkout_duration' => $this->calculateDurationFromTimes($checkout), // Update with calculated duration
                'status' => 'approved',
            ]);

            // Email is sent by the observer when status changes
        });

        Log::info("Applied deduction to checkout {$checkout->id}", [
            'staff_id' => $checkout->staff_id,
            'duration' => $checkout->checkout_duration,
            'deduction' => $checkout->deduction_amount,
            'adjusted_amount' => $checkout->adjusted_amount,
        ]);

        return true;
    }

    private function getApplicableRule(int $duration, int $staffId): ?CheckInCheckOutRule
    {
        return Cache::remember(
            "checkout_rule_{$duration}_{$staffId}",
            3600, // 1 hour
            function () use ($duration, $staffId) {
                return CheckInCheckOutRule::where('user_type', 'staff')
                    ->where('is_active', true)
                    ->where(function ($query) use ($staffId) {
                        $query->whereNull('user_id')
                              ->orWhere(function ($q) use ($staffId) {
                                  $q->where('user_id', $staffId);
                              });
                    })
                    ->where(function ($query) use ($duration) {
                        $query->whereNull('min_days')
                              ->orWhere('min_days', '<=', $duration);
                    })
                    ->where(function ($query) use ($duration) {
                        $query->whereNull('max_days')
                              ->orWhere('max_days', '>=', $duration);
                    })
                    ->orderBy('priority', 'desc')
                    ->orderBy('min_days', 'desc')
                    ->first();
            }
        );
    }

    public function clearRuleCache(): void
    {
        Cache::forget('universal_checkout_rule');
        Cache::forget('staff_checkout_rules');
        // Clear specific caches (simplified - in production, use tags)
        Cache::flush();
    }
}