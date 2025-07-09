<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Purchase;
use App\Models\Attachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Expense::with(['expense_category', 'student', 'supplier', 'payment_type', 'attachments', 'purchases']);

            // Apply filters
            if ($request->has('category_id')) {
                $query->where('expense_category_id', $request->category_id);
            }

            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
            }

            if ($request->has('expense_type')) {
                $query->where('expense_type', 'like', '%' . $request->expense_type . '%');
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('description', 'like', '%' . $search . '%')
                      ->orWhere('expense_type', 'like', '%' . $search . '%');
                });
            }

            // Order by created_at descending
            $query->orderBy('created_at', 'desc');

            // Paginate results
            $perPage = $request->get('per_page', 15);
            $expenses = $query->paginate($perPage);

            return response()->json($expenses);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve expenses',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'expense_category_id' => 'required|exists:expense_categories,id',
                'amount' => 'required|numeric|min:0',
                'expense_date' => 'required|date',
                'description' => 'nullable|string',
                'student_id' => 'nullable|exists:students,id',
                'staff_id' => 'nullable|string',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'paid_amount' => 'nullable|numeric|min:0',
                'due_amount' => 'nullable|numeric|min:0',
                'expense_attachment' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:2048',
                'purchases' => 'nullable|string', // JSON string of purchases
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Get category for auto-generating expense_type and title
            $category = ExpenseCategory::find($request->expense_category_id);
            $expenseType = $category ? $category->name : 'General';
            $title = $category ? $category->name : 'Expense';

            // Create expense
            $expense = Expense::create([
                'expense_category_id' => $request->expense_category_id,
                'expense_type' => $expenseType,
                'amount' => $request->amount,
                'expense_date' => $request->expense_date,
                'title' => $title,
                'description' => $request->description,
                'student_id' => $request->student_id,
                'staff_id' => $request->staff_id,
                'supplier_id' => $request->supplier_id,
                'payment_type_id' => $request->payment_type_id ?? 1, // Default to 1 if not provided
                'paid_amount' => $request->paid_amount ?? 0,
                'due_amount' => $request->due_amount ?? 0,
            ]);

            // Handle file upload
            if ($request->hasFile('expense_attachment')) {
                $file = $request->file('expense_attachment');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('expenses', $fileName, 'public');
                
                // Create attachment record
                Attachment::create([
                    'attachable_type' => 'App\Models\Expense',
                    'attachable_id' => $expense->id,
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);

                // Update expense with attachment path
                $expense->expense_attachment = Storage::url($filePath);
                $expense->save();
            }

            // Handle purchases
            if ($request->purchases) {
                $purchases = json_decode($request->purchases, true);
                if (is_array($purchases)) {
                    foreach ($purchases as $purchaseData) {
                        Purchase::create([
                            'expense_id' => $expense->id,
                            'item_name' => $purchaseData['item_name'],
                            'item_quantity' => $purchaseData['item_quantity'],
                            'item_price' => $purchaseData['item_price'],
                            'item_unit_price' => $purchaseData['item_unit_price'],
                            'purchase_date' => $purchaseData['purchase_date'],
                            'total_amount' => $purchaseData['total_amount'],
                        ]);
                    }
                }
            }

            DB::commit();

            // Load relationships and return
            $expense->load(['expense_category', 'student', 'supplier', 'payment_type', 'attachments', 'purchases']);
            
            return response()->json($expense, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create expense',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $expense = Expense::with(['expense_category', 'student', 'supplier', 'payment_type', 'attachments', 'purchases'])
                ->findOrFail($id);

            return response()->json($expense);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Expense not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $expense = Expense::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'expense_category_id' => 'required|exists:expense_categories,id',
                'amount' => 'required|numeric|min:0',
                'expense_date' => 'required|date',
                'description' => 'nullable|string',
                'student_id' => 'nullable|exists:students,id',
                'staff_id' => 'nullable|string',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'paid_amount' => 'nullable|numeric|min:0',
                'due_amount' => 'nullable|numeric|min:0',
                'expense_attachment' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:2048',
                'purchases' => 'nullable|string', // JSON string of purchases
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Get category for auto-generating expense_type and title
            $category = ExpenseCategory::find($request->expense_category_id);
            $expenseType = $category ? $category->name : 'General';
            $title = $category ? $category->name : 'Expense';

            // Update expense
            $expense->update([
                'expense_category_id' => $request->expense_category_id,
                'expense_type' => $expenseType,
                'amount' => $request->amount,
                'expense_date' => $request->expense_date,
                'title' => $title,
                'description' => $request->description,
                'student_id' => $request->student_id,
                'staff_id' => $request->staff_id,
                'supplier_id' => $request->supplier_id,
                'payment_type_id' => $request->payment_type_id ?? 1, // Default to 1 if not provided
                'paid_amount' => $request->paid_amount ?? 0,
                'due_amount' => $request->due_amount ?? 0,
            ]);

            // Handle file upload
            if ($request->hasFile('expense_attachment')) {
                // Delete old attachment if exists
                $oldAttachment = $expense->attachments()->first();
                if ($oldAttachment) {
                    Storage::disk('public')->delete($oldAttachment->file_path);
                    $oldAttachment->delete();
                }

                $file = $request->file('expense_attachment');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('expenses', $fileName, 'public');
                
                // Create new attachment record
                Attachment::create([
                    'attachable_type' => 'App\Models\Expense',
                    'attachable_id' => $expense->id,
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);

                // Update expense with attachment path
                $expense->expense_attachment = Storage::url($filePath);
                $expense->save();
            }

            // Handle purchases - delete existing and create new ones
            if ($request->purchases) {
                // Delete existing purchases
                $expense->purchases()->delete();
                
                $purchases = json_decode($request->purchases, true);
                if (is_array($purchases)) {
                    foreach ($purchases as $purchaseData) {
                        Purchase::create([
                            'expense_id' => $expense->id,
                            'item_name' => $purchaseData['item_name'],
                            'item_quantity' => $purchaseData['item_quantity'],
                            'item_price' => $purchaseData['item_price'],
                            'item_unit_price' => $purchaseData['item_unit_price'],
                            'purchase_date' => $purchaseData['purchase_date'],
                            'total_amount' => $purchaseData['total_amount'],
                        ]);
                    }
                }
            }

            DB::commit();

            // Load relationships and return
            $expense->load(['expense_category', 'student', 'supplier', 'payment_type', 'attachments', 'purchases']);
            
            return response()->json($expense);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to update expense',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $expense = Expense::findOrFail($id);

            DB::beginTransaction();

            // Delete associated attachments
            foreach ($expense->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }

            // Delete associated purchases
            $expense->purchases()->delete();

            // Delete the expense
            $expense->delete();

            DB::commit();

            return response()->json(['message' => 'Expense deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to delete expense',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
