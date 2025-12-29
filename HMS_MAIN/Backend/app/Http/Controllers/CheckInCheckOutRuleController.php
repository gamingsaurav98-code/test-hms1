<?php

namespace App\Http\Controllers;

use App\Models\CheckInCheckOutRule;
use App\Models\Student;
use App\Models\Staff;
use App\Services\DateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CheckInCheckOutRuleController extends Controller
{
    protected $dateService;

    public function __construct(DateService $dateService)
    {
        $this->dateService = $dateService;
    }

    /**
     * Display a listing of student checkout rules.
     */
    public function index(Request $request)
    {
        try {
            $query = CheckInCheckOutRule::query();

            // Filter by student
            if ($request->has('student_id')) {
                $query->where('user_id', $request->student_id)->where('user_type', 'student');
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $isActive = $request->is_active === 'true' || $request->is_active === '1';
                $query->where('is_active', $isActive);
            }

            // Filter by block (through student relationship)
            if ($request->has('block_id')) {
                $query->whereHas('student.room', function($q) use ($request) {
                    $q->where('block_id', $request->block_id);
                });
            }

            // Get all records without pagination if requested
            if ($request->has('all') && $request->all === 'true') {
                $rules = $query->orderBy('created_at', 'desc')->get();
                
                // Load relationships conditionally for each rule
                $rules->each(function ($rule) {
                    if ($rule->user_id) {
                        $rule->load(['student.room.block']);
                    }
                });

                // Return in paginated format for consistency
                return response()->json([
                    'data' => $rules,
                    'current_page' => 1,
                    'per_page' => $rules->count(),
                    'total' => $rules->count(),
                    'last_page' => 1,
                    'from' => $rules->count() > 0 ? 1 : 0,
                    'to' => $rules->count()
                ]);
            } else {
                $perPage = $request->has('per_page') ? (int)$request->per_page : 15;
                $rules = $query->orderBy('created_at', 'desc')->paginate($perPage);
                
                // Load relationships conditionally for each rule in the collection
                $rules->getCollection()->each(function ($rule) {
                    if ($rule->user_id) {
                        $rule->load(['student.room.block']);
                    }
                });

                return response()->json($rules);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch checkout rules: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created checkout rule.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'nullable|exists:students,id',
            'is_active' => 'nullable|boolean',
            'active_after_days' => 'nullable|integer|min:0',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'name' => 'nullable|string',
            'description' => 'nullable|string',
            'deduction_type' => 'nullable|in:percentage,fixed',
            'deduction_value' => 'required|numeric|min:0',
            'min_days' => 'nullable|integer|min:0',
            'max_days' => 'nullable|integer|min:0',
            'priority' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if there's already an active rule for this scope (student-specific or universal)
            $query = CheckInCheckOutRule::where('is_active', true);

            if ($request->student_id) {
                // For specific student rules, scope by user_type='student' and user_id
                $query->where('user_type', 'student')->where('user_id', $request->student_id);
            } else {
                // For universal rules, scope by NULL user_type and NULL user_id
                $query->whereNull('user_type')->whereNull('user_id');
            }

            $existingRule = $query->first();

            if ($existingRule) {
                return response()->json([
                    'status' => 'error',
                    'message' => $request->student_id 
                        ? 'Student already has an active checkout rule. Please deactivate the existing rule first.'
                        : 'There is already an active universal checkout rule. Please deactivate it first.'
                ], 422);
            }

            $rule = CheckInCheckOutRule::create([
                'user_type' => $request->student_id ? 'student' : null,
                'user_id' => $request->student_id ?? null,
                'is_active' => $request->is_active ?? true,
                'active_after_days' => $request->active_after_days,
                'percentage' => $request->percentage,
                'name' => $request->name,
                'description' => $request->description,
                'deduction_type' => $request->deduction_type ?? 'percentage',
                'deduction_value' => $request->deduction_value,
                'min_days' => $request->min_days,
                'max_days' => $request->max_days,
                'priority' => $request->priority ?? 1,
            ]);

            // Load relationships conditionally
            $relationships = [];
            if ($rule->user_id) {
                $relationships = ['student.room.block'];
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Checkout rule created successfully',
                'data' => $rule->load($relationships)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create checkout rule: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $rule = CheckInCheckOutRule::find($id);

            if (!$rule) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Checkout rule not found'
                ], 404);
            }

            // Load relationships conditionally
            $relationships = [
                'checkoutFinancials.checkInCheckOut',
                'checkInCheckOuts'
            ];
            
            if ($rule->user_id) {
                $relationships[] = 'student.room.block';
            }

            $rule->load($relationships);

            return response()->json([
                'status' => 'success',
                'data' => $rule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch checkout rule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified checkout rule.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'nullable|boolean',
            'active_after_days' => 'nullable|integer|min:0',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'name' => 'nullable|string',
            'description' => 'nullable|string',
            'deduction_type' => 'nullable|in:percentage,fixed',
            'deduction_value' => 'nullable|numeric|min:0',
            'min_days' => 'nullable|integer|min:0',
            'max_days' => 'nullable|integer|min:0',
            'priority' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $rule = CheckInCheckOutRule::find($id);
            if (!$rule) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Checkout rule not found'
                ], 404);
            }

            // If activating this rule, check if there's another active rule for the same scope
            if ($request->has('is_active') && $request->is_active) {
                $query = CheckInCheckOutRule::where('is_active', true)->where('id', '!=', $id);
                
                if ($rule->user_id) {
                    // For specific student rules, check if student has another active rule
                    $query->where('user_id', $rule->user_id);
                } else {
                    // For universal rules, check if there's another universal active rule
                    $query->whereNull('user_id');
                }
                
                $existingActiveRule = $query->first();

                if ($existingActiveRule) {
                    return response()->json([
                        'status' => 'error',
                        'message' => $rule->user_id 
                            ? 'Student already has another active checkout rule. Please deactivate it first.'
                            : 'There is already another active universal checkout rule. Please deactivate it first.'
                    ], 422);
                }
            }

            $rule->update($request->only([
                'is_active',
                'active_after_days',
                'percentage',
                'name',
                'description',
                'deduction_type',
                'deduction_value',
                'min_days',
                'max_days',
                'priority'
            ]));

            // Load relationships conditionally
            $relationships = [];
            if ($rule->user_id) {
                $relationships = ['student.room.block'];
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Checkout rule updated successfully',
                'data' => $rule->load($relationships)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update checkout rule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified checkout rule.
     */
    public function destroy(string $id)
    {
        try {
            $rule = CheckInCheckOutRule::find($id);
            if (!$rule) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Checkout rule not found'
                ], 404);
            }

            // Check if rule has associated checkout financials
            if ($rule->checkoutFinancials()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete rule that has associated financial records. Consider deactivating instead.'
                ], 422);
            }

            $rule->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Checkout rule deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete checkout rule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get checkout rules for a specific student
     */
    public function getStudentRules($studentId)
    {
        try {
            $student = Student::find($studentId);
            if (!$student) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Student not found'
                ], 404);
            }

            $rules = CheckInCheckOutRule::where('user_id', $studentId)
                ->with(['checkoutFinancials', 'checkInCheckOuts'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $rules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch student rules: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get checkout rules for a specific staff
     */
    public function getStaffRules($staffId)
    {
        try {
            $staff = Staff::find($staffId);
            if (!$staff) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Staff not found'
                ], 404);
            }

            $rules = CheckInCheckOutRule::where('user_id', $staffId)
                ->with(['checkoutFinancials', 'checkInCheckOuts'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $rules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch staff rules: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle rule active status
     */
    public function toggleStatus(Request $request, string $id)
    {
        try {
            $rule = CheckInCheckOutRule::find($id);
            if (!$rule) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Checkout rule not found'
                ], 404);
            }

            // If activating, check if student has another active rule
            if (!$rule->is_active) {
                $existingActiveRule = CheckInCheckOutRule::where('user_id', $rule->user_id)
                    ->where('is_active', true)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingActiveRule) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Student already has another active checkout rule. Please deactivate it first.'
                    ], 422);
                }
            }

            $rule->update(['is_active' => !$rule->is_active]);

            return response()->json([
                'status' => 'success',
                'message' => 'Rule status updated successfully',
                'data' => $rule->load(['student.room.block'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to toggle rule status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rule application preview for a student
     */
    public function getRulePreview(Request $request, $studentId)
    {
        try {
            $student = Student::find($studentId);
            if (!$student) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Student not found'
                ], 404);
            }

            $activeRule = CheckInCheckOutRule::where('user_id', $studentId)
                ->where('is_active', true)
                ->first();

            if (!$activeRule) {
                return response()->json([
                    'status' => 'info',
                    'message' => 'No active checkout rule found for this student',
                    'data' => null
                ]);
            }

            // Get student's latest monthly fee
            $latestFinancial = $student->financials()->latest('created_at')->first();
            $monthlyFee = $latestFinancial ? (float) $latestFinancial->monthly_fee : 0;

            // Calculate daily and hourly rates
            $dailyRate = $monthlyFee / 30;
            $hourlyRate = $dailyRate / 24;

            // Example calculations for different checkout durations
            $examples = [];
            foreach ([1, 2, 4, 8, 12, 24] as $hours) {
                $deduction = $hourlyRate * $hours * ($activeRule->percentage / 100);
                $examples[] = [
                    'duration_hours' => $hours,
                    'deducted_amount' => number_format($deduction, 2)
                ];
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'rule' => $activeRule,
                    'monthly_fee' => $monthlyFee,
                    'daily_rate' => number_format($dailyRate, 2),
                    'hourly_rate' => number_format($hourlyRate, 2),
                    'examples' => $examples
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate rule preview: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rule application preview for a staff
     */
    public function getStaffRulePreview(Request $request, $staffId)
    {
        try {
            $staff = Staff::find($staffId);
            if (!$staff) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Staff not found'
                ], 404);
            }

            $activeRule = CheckInCheckOutRule::where('user_id', $staffId)
                ->where('is_active', true)
                ->first();

            if (!$activeRule) {
                return response()->json([
                    'status' => 'info',
                    'message' => 'No active checkout rule found for this staff',
                    'data' => null
                ]);
            }

            // Get staff's latest salary
            $latestSalary = $staff->salaries()->latest('created_at')->first();
            $monthlySalary = $latestSalary ? (float) $latestSalary->amount : 0;

            // Calculate daily and hourly rates
            $dailyRate = $monthlySalary / 30;
            $hourlyRate = $dailyRate / 24;

            // Example calculations for different checkout durations
            $examples = [];
            foreach ([1, 2, 4, 8, 12, 24] as $hours) {
                $deduction = $hourlyRate * $hours * ($activeRule->percentage / 100);
                $examples[] = [
                    'duration_hours' => $hours,
                    'deducted_amount' => number_format($deduction, 2)
                ];
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'rule' => $activeRule,
                    'monthly_salary' => $monthlySalary,
                    'daily_rate' => number_format($dailyRate, 2),
                    'hourly_rate' => number_format($hourlyRate, 2),
                    'examples' => $examples
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate rule preview: ' . $e->getMessage()
            ], 500);
        }
    }
}
