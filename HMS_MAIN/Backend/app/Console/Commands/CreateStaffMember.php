<?php

namespace App\Console\Commands;

use App\Models\Staff;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CreateStaffMember extends Command
{
    protected $signature = 'staff:create {name} {email} {phone} {blood_group} {salary}';
    protected $description = 'Create a new staff member with provided details';

    private $logPath;
    
    public function __construct()
    {
        parent::__construct();
        // Try workspace path first, then container path, then storage path
        $workspacePath = '/home/avinash/Documents/Lumica1/.cursor/debug.log';
        $containerPath = '/var/www/html/.cursor/debug.log';
        $storagePath = base_path('storage/logs/debug.log');
        
        // Check which path is accessible
        if (file_exists(dirname($workspacePath)) || is_writable(dirname($workspacePath))) {
            $this->logPath = $workspacePath;
        } elseif (is_writable(dirname($containerPath))) {
            $this->logPath = $containerPath;
        } else {
            $this->logPath = $storagePath;
        }
        
        // Ensure directory exists
        $logDir = dirname($this->logPath);
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
    }

    private function log($location, $message, $data, $hypothesisId = 'A')
    {
        try {
            $logEntry = json_encode([
                'id' => 'log_' . time() . '_' . uniqid(),
                'timestamp' => (int)(microtime(true) * 1000),
                'location' => $location,
                'message' => $message,
                'data' => $data,
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => $hypothesisId
            ]) . "\n";
            
            // Ensure directory exists before writing
            $logDir = dirname($this->logPath);
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0755, true);
            }
            
            @file_put_contents($this->logPath, $logEntry, FILE_APPEND);
        } catch (\Exception $e) {
            // Silently fail logging to not break the command
        }
    }

    public function handle(): int
    {
        // #region agent log
        $this->log('CreateStaffMember.php:handle', 'Command started', [
            'name' => $this->argument('name'),
            'email' => $this->argument('email'),
            'phone' => $this->argument('phone'),
            'blood_group' => $this->argument('blood_group'),
            'salary' => $this->argument('salary')
        ], 'A');
        // #endregion

        $name = $this->argument('name');
        $email = $this->argument('email');
        $phone = $this->argument('phone');
        $bloodGroup = $this->argument('blood_group');
        $salary = $this->argument('salary');

        // #region agent log
        $this->log('CreateStaffMember.php:handle', 'Arguments parsed', [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'blood_group' => $bloodGroup,
            'salary' => $salary
        ], 'B');
        // #endregion

        // Check if email already exists
        // #region agent log
        $existingStaff = Staff::where('email', $email)->first();
        $this->log('CreateStaffMember.php:handle', 'Email uniqueness check', [
            'email' => $email,
            'exists' => $existingStaff !== null,
            'existing_id' => $existingStaff ? $existingStaff->id : null
        ], 'A');
        // #endregion

        if ($existingStaff) {
            $this->error("Staff with email {$email} already exists (ID: {$existingStaff->id})");
            // #region agent log
            $this->log('CreateStaffMember.php:handle', 'Email already exists error', [
                'email' => $email,
                'existing_id' => $existingStaff->id
            ], 'A');
            // #endregion
            return self::FAILURE;
        }

        // Prepare data for validation
        $data = [
            'staff_name' => $name,
            'date_of_birth' => Carbon::now()->subYears(25)->toDateString(), // Default DOB
            'contact_number' => $phone,
            'email' => $email,
            'blood_group' => strtoupper($bloodGroup), // Normalize blood group
            'salary_amount' => (string)$salary,
            'is_active' => true,
        ];

        // #region agent log
        $this->log('CreateStaffMember.php:handle', 'Data prepared for validation', $data, 'B');
        // #endregion

        // Validate data
        $validator = Validator::make($data, [
            'staff_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|unique:staff,email|max:255',
            'blood_group' => 'nullable|string|max:10',
            'salary_amount' => 'nullable|string',
        ]);

        // #region agent log
        $this->log('CreateStaffMember.php:handle', 'Validation performed', [
            'valid' => !$validator->fails(),
            'errors' => $validator->errors()->toArray()
        ], 'C');
        // #endregion

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error("  - {$error}");
            }
            // #region agent log
            $this->log('CreateStaffMember.php:handle', 'Validation failed', [
                'errors' => $validator->errors()->toArray()
            ], 'C');
            // #endregion
            return self::FAILURE;
        }

        // #region agent log
        $this->log('CreateStaffMember.php:handle', 'Before database transaction', $data, 'D');
        // #endregion

        try {
            DB::beginTransaction();

            // #region agent log
            $this->log('CreateStaffMember.php:handle', 'Transaction started', [], 'D');
            // #endregion

            $staff = Staff::create($data);

            // #region agent log
            $this->log('CreateStaffMember.php:handle', 'Staff created in database', [
                'staff_id' => $staff->id,
                'staff_name' => $staff->staff_name,
                'email' => $staff->email
            ], 'D');
            // #endregion

            DB::commit();

            // #region agent log
            $this->log('CreateStaffMember.php:handle', 'Transaction committed', [
                'staff_id' => $staff->id
            ], 'D');
            // #endregion

            $this->info("Staff member created successfully!");
            $this->info("ID: {$staff->id}");
            $this->info("Name: {$staff->staff_name}");
            $this->info("Email: {$staff->email}");
            $this->info("Phone: {$staff->contact_number}");
            $this->info("Blood Group: {$staff->blood_group}");
            $this->info("Salary: {$staff->salary_amount}");

            return self::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            
            // #region agent log
            $this->log('CreateStaffMember.php:handle', 'Exception caught', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 'E');
            // #endregion

            $this->error("Failed to create staff member: {$e->getMessage()}");
            $this->error("File: {$e->getFile()}");
            $this->error("Line: {$e->getLine()}");
            
            return self::FAILURE;
        }
    }
}

