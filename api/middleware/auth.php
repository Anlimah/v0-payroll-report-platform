<?php
function authenticate() {
    $headers = getallheaders();
    
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'No authorization token provided'
        ]);
        exit();
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    
    // Decode JWT token
    $decoded = verifyToken($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired token'
        ]);
        exit();
    }

    return $decoded;
}

function requireAdmin($user) {
    if ($user->role !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Admin access required'
        ]);
        exit();
    }
}

function verifyToken($token) {
    // Simple JWT verification (in production, use a proper JWT library)
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return false;
    }

    $payload = json_decode(base64_decode($parts[1]));
    
    if (!$payload || !isset($payload->exp) || $payload->exp < time()) {
        return false;
    }

    return $payload;
}

function generateToken($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'full_name' => $user['full_name'],
        'exp' => time() + (60 * 60 * 8) // 8 hours
    ]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'your-secret-key-change-this', true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}
?>
