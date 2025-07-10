<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Staff::query();

            // Apply search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('staff_name', 'like', '%' . $search . '%')
                      ->orWhere('staff_id', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%')
                      ->orWhere('contact_number', 'like', '%' . $search . '%');
                });
            }

            // Get all staff without pagination for dropdowns
            if ($request->has('all') && $request->all === 'true') {
                $staff = $query->select('id', 'staff_id', 'staff_name', 'email', 'contact_number')
                    ->orderBy('staff_name')
                    ->get();
                return response()->json($staff);
            }

            // Return paginated results
            $perPage = $request->get('per_page', 15);
            $staff = $query->paginate($perPage);

            return response()->json($staff);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch staff',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not needed for API
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Implementation would go here if needed
        return response()->json(['message' => 'Staff creation not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $staff = Staff::with(['salaries' => function($query) {
                $query->orderBy('year', 'desc')->orderBy('month', 'desc');
            }])->findOrFail($id);
            
            return response()->json($staff);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Staff not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Not needed for API
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Implementation would go here if needed
        return response()->json(['message' => 'Staff update not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Implementation would go here if needed
        return response()->json(['message' => 'Staff deletion not implemented yet'], 501);
    }
}
