<?php
header('Content-Type: application/json');

function authenticate()
{
    $headers = getallheaders();
    $authHeader = null;

    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (!$authHeader) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'No authorization token provided'
        ]);
        exit;
    }

    $token = str_replace('Bearer ', '', $authHeader);
    $decoded = verifyToken($token);

    if (!$decoded) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired token'
        ]);
        exit;
    }

    // ✅ RETURN OBJECT (unchanged behaviour)
    return $decoded;
}

function requireAdmin($user)
{
    if (!isset($user->role) || $user->role !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Admin access required'
        ]);
        exit;
    }
}

function verifyToken($token)
{
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
