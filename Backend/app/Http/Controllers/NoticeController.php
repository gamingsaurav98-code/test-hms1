<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class NoticeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $notices = Notice::with('attachments')->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json($notices);
    }
    
    /**
     * Debug endpoint to check schema
     */
    public function debug()
    {
        // Get current column schema information
        $connection = \DB::connection();
        $schema = $connection->getDoctrineSchemaManager();
        $table = $schema->listTableDetails('notices');
        
        $targetTypeColumn = $table->getColumn('target_type');
        $noticeTypeColumn = $table->getColumn('notice_type');
        
        // Fetch enum types using a raw query as Doctrine might not expose this
        $targetTypeEnum = \DB::select("SHOW COLUMNS FROM notices WHERE Field = 'target_type'")[0];
        $noticeTypeEnum = \DB::select("SHOW COLUMNS FROM notices WHERE Field = 'notice_type'")[0];
        
        return response()->json([
            'target_type' => [
                'default' => $targetTypeColumn->getDefault(),
                'type' => $targetTypeColumn->getType()->getName(),
                'definition' => $targetTypeEnum->Type ?? null,
            ],
            'notice_type' => [
                'default' => $noticeTypeColumn->getDefault(),
                'type' => $noticeTypeColumn->getType()->getName(),
                'definition' => $noticeTypeEnum->Type ?? null,
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'schedule_time' => 'required|date',
            'status' => 'nullable|string|in:active,inactive',
            'target_type' => 'required|string|in:all,student,staff,specific_student,specific_staff,block',
            'notice_type' => 'nullable|string|in:general,urgent,event,announcement',
            'notice_attachments' => 'nullable|array',
            'notice_attachments.*' => 'file|max:10240', // Max 10MB per file
            'student_id' => 'nullable|exists:students,id',
            'staff_id' => 'nullable|exists:staff,id',
            'block_id' => 'nullable|exists:blocks,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $notice = Notice::create([
            'title' => $request->title,
            'description' => $request->description,
            'schedule_time' => $request->schedule_time,
            'status' => $request->status ?? 'active',
            'target_type' => $request->target_type,
            'notice_type' => $request->notice_type ?? 'general',
            'student_id' => $request->student_id,
            'staff_id' => $request->staff_id,
            'block_id' => $request->block_id,
            'notice_attachment' => null, // We'll update this if files are uploaded
        ]);

        // Handle attachments
        if ($request->hasFile('notice_attachments')) {
            $mainAttachment = null;
            
            foreach ($request->file('notice_attachments') as $index => $file) {
                $path = $file->store('notice_attachments', 'public');
                
                $attachment = new Attachment([
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getClientMimeType(),
                    'notice_id' => $notice->id,
                ]);
                
                $attachment->save();
                
                // Use the first attachment as the main notice_attachment
                if ($index === 0) {
                    $mainAttachment = $path;
                }
            }
            
            // Update the notice with the main attachment
            if ($mainAttachment) {
                $notice->notice_attachment = $mainAttachment;
                $notice->save();
            }
        }

        return response()->json($notice->load('attachments'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $notice = Notice::with('attachments')->findOrFail($id);
        return response()->json($notice);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $notice = Notice::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'schedule_time' => 'sometimes|required|date',
            'status' => 'nullable|string|in:active,inactive',
            'target_type' => 'sometimes|required|string|in:all,student,staff,specific_student,specific_staff,block',
            'notice_type' => 'nullable|string|in:general,urgent,event,announcement',
            'notice_attachments' => 'nullable|array',
            'notice_attachments.*' => 'file|max:10240', // Max 10MB per file
            'student_id' => 'nullable|exists:students,id',
            'staff_id' => 'nullable|exists:staff,id',
            'block_id' => 'nullable|exists:blocks,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $notice->update([
            'title' => $request->title ?? $notice->title,
            'description' => $request->description ?? $notice->description,
            'schedule_time' => $request->schedule_time ?? $notice->schedule_time,
            'status' => $request->status ?? $notice->status,
            'target_type' => $request->target_type ?? $notice->target_type,
            'notice_type' => $request->notice_type ?? $notice->notice_type,
            'student_id' => $request->student_id ?? $notice->student_id,
            'staff_id' => $request->staff_id ?? $notice->staff_id,
            'block_id' => $request->block_id ?? $notice->block_id,
        ]);

        // Handle attachments
        if ($request->hasFile('notice_attachments')) {
            $mainAttachment = null;
            $isFirstAttachment = !$notice->attachments()->exists();
            
            foreach ($request->file('notice_attachments') as $index => $file) {
                $path = $file->store('notice_attachments', 'public');
                
                $attachment = new Attachment([
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getClientMimeType(),
                    'notice_id' => $notice->id,
                ]);
                
                $attachment->save();
                
                // If this is the first attachment and no main attachment exists
                if ($index === 0 && ($isFirstAttachment || !$notice->notice_attachment)) {
                    $mainAttachment = $path;
                }
            }
            
            // Update the notice with the main attachment if needed
            if ($mainAttachment) {
                $notice->notice_attachment = $mainAttachment;
                $notice->save();
            }
        }

        return response()->json($notice->load('attachments'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $notice = Notice::findOrFail($id);
        
        // Delete all attachments and their files
        foreach ($notice->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->path);
            $attachment->delete();
        }
        
        $notice->delete();
        
        return response()->json(null, 204);
    }
    
    /**
     * Delete an attachment from a notice.
     */
    public function deleteAttachment(string $noticeId, string $attachmentId)
    {
        $notice = Notice::findOrFail($noticeId);
        $attachment = Attachment::where('id', $attachmentId)
            ->where('notice_id', $noticeId)
            ->firstOrFail();
        
        $attachmentPath = $attachment->path;
        
        // Check if this is the main attachment
        $isMainAttachment = $notice->notice_attachment === $attachmentPath;
        
        // Delete the file from storage
        Storage::disk('public')->delete($attachmentPath);
        
        // Delete the attachment record
        $attachment->delete();
        
        // If this was the main attachment, update the notice to use another attachment or null
        if ($isMainAttachment) {
            $newMainAttachment = $notice->attachments()->first();
            $notice->notice_attachment = $newMainAttachment ? $newMainAttachment->path : null;
            $notice->save();
        }
        
        return response()->json(null, 204);
    }
}
