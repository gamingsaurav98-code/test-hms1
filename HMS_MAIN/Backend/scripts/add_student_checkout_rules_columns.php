<?php
// Adds missing columns to student_checkout_rules safely
$dotenvPath = __DIR__ . '/../.env';
if (!file_exists($dotenvPath)) {
    echo ".env not found\n";
    exit(1);
}
$env = file($dotenvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$config = [];
foreach ($env as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') === false) continue;
    [$k,$v] = explode('=', $line, 2);
    $val = trim($v);
    if (strlen($val) >= 2) {
        $first = $val[0];
        $last = $val[strlen($val)-1];
        if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
            $val = substr($val, 1, -1);
        }
    }
    $config[trim($k)] = $val;
}
$host = $config['DB_HOST'] ?? '127.0.0.1';
$port = $config['DB_PORT'] ?? '3306';
$dbname = $config['DB_DATABASE'] ?? '';
$user = $config['DB_USERNAME'] ?? '';
$pass = $config['DB_PASSWORD'] ?? '';
$dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) {
    echo "DB connection failed: " . $e->getMessage() . "\n";
    exit(1);
}
$columnsToAdd = [
    'name' => "VARCHAR(255) NULL",
    'description' => "TEXT NULL",
    'deduction_type' => "ENUM('percentage','fixed') DEFAULT 'percentage'",
    'deduction_value' => "DECIMAL(8,2) NULL",
    'min_days' => "INT NULL",
    'max_days' => "INT NULL",
    'priority' => "INT DEFAULT 1",
];
foreach ($columnsToAdd as $col => $definition) {
    // check if column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?');
    $stmt->execute([$dbname, 'student_checkout_rules', $col]);
    $exists = (int)$stmt->fetchColumn() > 0;
    if ($exists) {
        echo "Column {$col} already exists, skipping.\n";
        continue;
    }
    $sql = "ALTER TABLE `student_checkout_rules` ADD COLUMN `{$col}` {$definition};";
    try {
        $pdo->exec($sql);
        echo "Added column {$col}.\n";
    } catch (Exception $e) {
        echo "Failed to add {$col}: " . $e->getMessage() . "\n";
    }
}
echo "Done.\n";
