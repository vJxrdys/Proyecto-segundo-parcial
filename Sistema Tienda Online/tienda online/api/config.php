<?php
// =====================================================
// CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS
// =====================================================

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'tienda_online');

// Crear conexión
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $conn->connect_error
    ]));
}

// Configurar charset UTF-8
$conn->set_charset("utf8mb4");

// Habilitar reporte de errores para desarrollo
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Función para sanitizar datos
function sanitize($conn, $data) {
    return $conn->real_escape_string(trim($data));
}

// Función para responder en JSON
function respond($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
?>
