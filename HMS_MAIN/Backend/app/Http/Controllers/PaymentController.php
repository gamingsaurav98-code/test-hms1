<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Student;
use App\Models\Staff;
use App\Models\User;
use App\Mail\PaymentInitiatedStudent;
use App\Mail\PaymentNotificationAdmin;
use App\Mail\SalaryPaymentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Get all payments with filtering
     */
    public function index(Request $request)
    {
        $query = Payment::query();

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by payment type
        if ($request->has('payment_type')) {
            $query->byPaymentType($request->payment_type);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by staff
        if ($request->has('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        // Pagination
        $payments = $query->with(['student', 'staff', 'admin'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    /**
     * Create a student payment with email notification
     */
    public function createStudentPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_type' => 'required|in:tuition,hostel_fee,amenities,other',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $student = Student::findOrFail($request->student_id);

            // Create the payment
            $payment = Payment::create([
                'student_id' => $student->id,
                'admin_id' => auth()->user()->id,
                'amount' => $request->amount,
                'payment_type' => $request->payment_type,
                'description' => $request->description,
                'status' => 'pending',
                'notes' => $request->notes,
                'transaction_id' => 'TXN-' . time() . '-' . rand(1000, 9999),
            ]);

            // Send email to student
            if ($student->email) {
                Mail::to($student->email)->send(
                    new PaymentInitiatedStudent($payment, $student->student_name, $student->email)
                );
            }

            // Send notification to all admins
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                if ($admin->email) {
                    Mail::to($admin->email)->send(
                        new PaymentNotificationAdmin($payment, $student->student_name, 'student')
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment created and emails sent successfully',
                'data' => $payment->load(['student', 'admin']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error creating payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a staff salary payment with email notification
     */
    public function createSalaryPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|exists:staff,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'paid_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $staff = Staff::findOrFail($request->staff_id);

            // Create the payment
            $payment = Payment::create([
                'staff_id' => $staff->id,
                'admin_id' => auth()->user()->id,
                'amount' => $request->amount,
                'payment_type' => 'salary',
                'description' => $request->description ?? 'Monthly Salary',
                'status' => 'completed',
                'notes' => $request->notes,
                'paid_at' => $request->paid_at ?? now(),
                'transaction_id' => 'SAL-' . time() . '-' . rand(1000, 9999),
            ]);

            // Send salary payment email to staff
            if ($staff->email) {
                Mail::to($staff->email)->send(
                    new SalaryPaymentNotification($payment, $staff->staff_name, $staff->email)
                );
            }

            // Send notification to all admins
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                if ($admin->email) {
                    Mail::to($admin->email)->send(
                        new PaymentNotificationAdmin($payment, $staff->staff_name, 'staff')
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Salary payment created and emails sent successfully',
                'data' => $payment->load(['staff', 'admin']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error creating salary payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment details
     */
    public function show($id)
    {
        try {
            $payment = Payment::with(['student', 'staff', 'admin'])->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Payment not found',
            ], 404);
        }
    }

    /**
     * Update payment status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,completed,failed,refunded',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $payment = Payment::findOrFail($id);

            switch ($request->status) {
                case 'completed':
                    $payment->markAsCompleted();
                    break;
                case 'failed':
                    $payment->markAsFailed();
                    break;
                case 'refunded':
                    $payment->update(['status' => 'refunded']);
                    break;
                default:
                    $payment->markAsPending();
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => $payment,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error updating payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get student payment history
     */
    public function studentPaymentHistory($studentId)
    {
        try {
            $payments = Payment::where('student_id', $studentId)
                ->with(['admin'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error fetching payment history: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get staff payment history
     */
    public function staffPaymentHistory($staffId)
    {
        try {
            $payments = Payment::where('staff_id', $staffId)
                ->with(['admin'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error fetching payment history: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment statistics
     */
    public function statistics(Request $request)
    {
        try {
            $from = $request->get('from', now()->startOfMonth());
            $to = $request->get('to', now()->endOfMonth());

            $stats = [
                'total_payments' => Payment::count(),
                'total_amount' => Payment::sum('amount'),
                'completed_payments' => Payment::byStatus('completed')->count(),
                'pending_payments' => Payment::byStatus('pending')->count(),
                'failed_payments' => Payment::byStatus('failed')->count(),
                'refunded_payments' => Payment::byStatus('refunded')->count(),
                'by_type' => Payment::selectRaw('payment_type, COUNT(*) as count, SUM(amount) as total')
                    ->groupBy('payment_type')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error fetching statistics: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resend payment email
     */
    public function resendEmail($id)
    {
        try {
            $payment = Payment::with(['student', 'staff'])->findOrFail($id);

            if ($payment->student && $payment->student->email) {
                Mail::to($payment->student->email)->send(
                    new PaymentInitiatedStudent($payment, $payment->student->student_name, $payment->student->email)
                );
            } elseif ($payment->staff && $payment->staff->email) {
                Mail::to($payment->staff->email)->send(
                    new SalaryPaymentNotification($payment, $payment->staff->staff_name, $payment->staff->email)
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Email resent successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error resending email: ' . $e->getMessage(),
            ], 500);
        }
    }
}
