<?php

namespace App\Services;

use App\Models\CheckoutRule;
use App\Models\StudentCheckoutRule;
use App\Models\StudentCheckInCheckOut;
use App\Models\Student;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class StudentCheckoutDeductionService
{
    public function calculateDeduction(StudentCheckInCheckOut $checkout): array
    {
        // Calculate duration from actual times instead of stored duration
        $duration = $this->calculateDurationFromTimes($checkout);
        $monthlyFee = $checkout->student->monthly_fee;
        // Per new requirement: ignore min_days/max_days and use universal rule (user_id = NULL)
        // Fetch universal rule first (applies to all students). If not present, fallback to any per-student rule (by priority).
        $universalRule = Cache::remember(
            "student_checkout_rule_universal",
            3600,
            function () {
                return StudentCheckoutRule::where('is_active', true)
                    ->whereNull('student_id')
                    ->orderBy('priority', 'desc')
                    ->first();
            }
        );

        // Use only the universal rule (no per-user fallback). If missing, notify admin and return message.
        $ruleForCalculation = $universalRule;

        if (!$universalRule) {
            $adminMessage = 'Universal checkout rule for students is not set. Please configure a universal rule in checkout_rules.';
            Log::warning('Universal checkout rule missing for students', [
                'student_id' => $checkout->student_id,
                'duration' => $duration,
            ]);

            throw new \Exception($adminMessage);
        }

        // Calculate prorate (duration / 30)
        $prorateRatio = $duration / 30;

        $deductionAmount = 0;

        // Use the selected rule for both deduction type and value (no min/max checks)
        $deductionType = $ruleForCalculation->deduction_type;
        $deductionValue = $ruleForCalculation->deduction_value;

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

    private function calculateDurationFromTimes(StudentCheckInCheckOut $checkout): int
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

    public function applyDeduction(StudentCheckInCheckOut $checkout): bool
    {
        DB::transaction(function () use ($checkout) {
            $calculation = $this->calculateDeduction($checkout);

            $checkout->update([
                'deduction_amount' => $calculation['deduction_amount'],
                'adjusted_fee' => $calculation['adjusted_fee'],
                'rule_applied' => $calculation['rule_applied'],
                'checkout_duration' => $this->calculateDurationFromTimes($checkout), // Update with calculated duration
                'status' => 'approved',
            ]);

            // Email is sent by the observer when status changes
        });

        Log::info("Applied deduction to checkout {$checkout->id}", [
            'student_id' => $checkout->student_id,
            'duration' => $checkout->checkout_duration,
            'deduction' => $checkout->deduction_amount,
            'adjusted_fee' => $checkout->adjusted_fee,
        ]);

        return true;
    }

    private function getApplicableRule(int $duration, int $studentId): ?CheckoutRule
    {
        return Cache::remember(
            "checkout_rule_{$duration}_{$studentId}",
            3600, // 1 hour
            function () use ($duration, $studentId) {
                return CheckoutRule::active()
                    ->where(function ($query) use ($studentId) {
                        $query->whereNull('user_id')
                              ->orWhere(function ($q) use ($studentId) {
                                  $q->where('user_type', 'student')
                                    ->where('user_id', $studentId);
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
        Cache::forget('student_checkout_rules');
        // Clear specific caches (simplified - in production, use tags)
        Cache::flush();
    }
}