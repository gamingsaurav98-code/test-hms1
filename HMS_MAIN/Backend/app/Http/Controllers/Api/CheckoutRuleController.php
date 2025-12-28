<?php

namespace App\Http\Controllers\Api;

use App\Models\CheckoutRule;
use App\Services\StudentCheckoutDeductionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class CheckoutRuleController extends Controller
{
    public function index(): JsonResponse
    {
        $rules = CheckoutRule::active()->get();
        return response()->json(['data' => $rules]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_type' => 'required|in:student,staff',
            'user_id' => 'nullable|integer',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'deduction_type' => 'required|in:percentage,fixed',
            'deduction_value' => 'required|numeric|min:0',
            'min_days' => 'nullable|integer|min:1',
            'max_days' => 'nullable|integer|min:1',
            'priority' => 'integer|min:1',
        ]);

        $rule = CheckoutRule::create($validated);

        // Clear cache
        app(StudentCheckoutDeductionService::class)->clearRuleCache();

        return response()->json(['data' => $rule], 201);
    }

    public function update(Request $request, CheckoutRule $rule): JsonResponse
    {
        $validated = $request->validate([
            'user_type' => 'required|in:student,staff',
            'user_id' => 'nullable|integer',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'deduction_type' => 'required|in:percentage,fixed',
            'deduction_value' => 'required|numeric|min:0',
            'min_days' => 'nullable|integer|min:1',
            'max_days' => 'nullable|integer|min:1',
            'priority' => 'integer|min:1',
        ]);

        $rule->update($validated);

        // Clear cache
        app(StudentCheckoutDeductionService::class)->clearRuleCache();

        return response()->json(['data' => $rule]);
    }

    public function destroy(CheckoutRule $rule): JsonResponse
    {
        $rule->delete();

        // Clear cache
        app(StudentCheckoutDeductionService::class)->clearRuleCache();

        return response()->json(['message' => 'Rule deleted']);
    }
}