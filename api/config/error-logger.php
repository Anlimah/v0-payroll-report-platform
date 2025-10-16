<?php
class ErrorLogger
{
    private static $logFile = __DIR__ . '/../logs/database_errors.log';

    public static function logError($exception, $context = [])
    {
        // Create logs directory if it doesn't exist
        $logDir = dirname(self::$logFile);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        // Create log file if it doesn't exist
        if (!file_exists(self::$logFile)) {
            touch(self::$logFile);
            chmod(self::$logFile, 0644);
        }

        $timestamp = date('Y-m-d H:i:s');
        $message = $exception->getMessage();
        $trace = $exception->getTraceAsString();
        $file = $exception->getFile();
        $line = $exception->getLine();

        $logEntry = "\n" . str_repeat("=", 80) . "\n";
        $logEntry .= "[$timestamp] ERROR\n";
        $logEntry .= "Message: $message\n";
        $logEntry .= "File: $file\n";
        $logEntry .= "Line: $line\n";

        if (!empty($context)) {
            $logEntry .= "Context: " . json_encode($context) . "\n";
        }

        $logEntry .= "Stack Trace:\n$trace\n";
        $logEntry .= str_repeat("=", 80) . "\n";

        error_log($logEntry, 3, self::$logFile);
    }

    public static function logDatabaseError($exception, $query = '', $params = [])
    {
        $context = [
            'query' => $query,
            'params' => $params,
            'type' => 'DATABASE_ERROR'
        ];
        self::logError($exception, $context);
    }

    public static function logAuthError($exception, $username = '')
    {
        $context = [
            'username' => $username,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'type' => 'AUTH_ERROR'
        ];
        self::logError($exception, $context);
    }
}
