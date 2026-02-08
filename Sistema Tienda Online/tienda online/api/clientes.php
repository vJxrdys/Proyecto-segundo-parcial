<?php
// =====================================================
// API PARA GESTIÓN DE CLIENTES
// =====================================================

require_once 'config.php';

// Permitir CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Manejar solicitudes según método
switch ($method) {
    case 'GET':
        getClientes();
        break;
    case 'POST':
        createCliente();
        break;
    case 'PUT':
        updateCliente();
        break;
    case 'DELETE':
        deleteCliente();
        break;
    default:
        respond(false, 'Método no permitido');
}

// =====================================================
// OBTENER CLIENTES
// =====================================================
function getClientes() {
    global $conn;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if ($id) {
        // Obtener un cliente específico
        $sql = "SELECT * FROM CLIENTE WHERE id_cliente = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            respond(true, 'Cliente encontrado', $result->fetch_assoc());
        } else {
            respond(false, 'Cliente no encontrado');
        }
    } else {
        // Obtener todos los clientes
        $sql = "SELECT * FROM CLIENTE ORDER BY fecha_registro DESC";
        $result = $conn->query($sql);
        
        $clientes = [];
        while ($row = $result->fetch_assoc()) {
            $clientes[] = $row;
        }
        
        respond(true, 'Clientes obtenidos', $clientes);
    }
}

// =====================================================
// CREAR CLIENTE
// =====================================================
function createCliente() {
    global $conn;
    
    // Obtener datos JSON
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos requeridos
    if (empty($data['nombre']) || empty($data['apellido']) || empty($data['email'])) {
        respond(false, 'Nombre, apellido y email son obligatorios');
    }
    
    // Validar formato de email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        respond(false, 'Email no válido');
    }
    
    // Verificar si el email ya existe
    $email = sanitize($conn, $data['email']);
    $checkSql = "SELECT id_cliente FROM CLIENTE WHERE email = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        respond(false, 'El email ya está registrado');
    }
    
    // Preparar datos
    $nombre = sanitize($conn, $data['nombre']);
    $apellido = sanitize($conn, $data['apellido']);
    $telefono = isset($data['telefono']) ? sanitize($conn, $data['telefono']) : null;
    $direccion = isset($data['direccion']) ? sanitize($conn, $data['direccion']) : null;
    $ciudad = isset($data['ciudad']) ? sanitize($conn, $data['ciudad']) : null;
    $pais = isset($data['pais']) ? sanitize($conn, $data['pais']) : null;
    $codigo_postal = isset($data['codigo_postal']) ? sanitize($conn, $data['codigo_postal']) : null;
    
    // Insertar cliente
    $sql = "INSERT INTO CLIENTE (nombre, apellido, email, telefono, direccion, ciudad, pais, codigo_postal) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssss", $nombre, $apellido, $email, $telefono, $direccion, $ciudad, $pais, $codigo_postal);
    
    if ($stmt->execute()) {
        $id_cliente = $conn->insert_id;
        
        // Obtener el cliente recién creado
        $getStmt = $conn->prepare("SELECT * FROM CLIENTE WHERE id_cliente = ?");
        $getStmt->bind_param("i", $id_cliente);
        $getStmt->execute();
        $cliente = $getStmt->get_result()->fetch_assoc();
        
        respond(true, 'Cliente creado exitosamente', $cliente);
    } else {
        respond(false, 'Error al crear cliente: ' . $conn->error);
    }
}

// =====================================================
// ACTUALIZAR CLIENTE
// =====================================================
function updateCliente() {
    global $conn;
    
    // Obtener datos JSON
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar ID
    if (empty($data['id_cliente'])) {
        respond(false, 'ID de cliente requerido');
    }
    
    $id_cliente = intval($data['id_cliente']);
    
    // Verificar si el cliente existe
    $checkSql = "SELECT id_cliente FROM CLIENTE WHERE id_cliente = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param("i", $id_cliente);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows === 0) {
        respond(false, 'Cliente no encontrado');
    }
    
    // Preparar actualización
    $updates = [];
    $types = "";
    $values = [];
    
    if (isset($data['nombre'])) {
        $updates[] = "nombre = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['nombre']);
    }
    if (isset($data['apellido'])) {
        $updates[] = "apellido = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['apellido']);
    }
    if (isset($data['email'])) {
        $updates[] = "email = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['email']);
    }
    if (isset($data['telefono'])) {
        $updates[] = "telefono = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['telefono']);
    }
    if (isset($data['direccion'])) {
        $updates[] = "direccion = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['direccion']);
    }
    if (isset($data['ciudad'])) {
        $updates[] = "ciudad = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['ciudad']);
    }
    if (isset($data['pais'])) {
        $updates[] = "pais = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['pais']);
    }
    if (isset($data['codigo_postal'])) {
        $updates[] = "codigo_postal = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['codigo_postal']);
    }
    
    if (empty($updates)) {
        respond(false, 'No hay datos para actualizar');
    }
    
    $sql = "UPDATE CLIENTE SET " . implode(", ", $updates) . " WHERE id_cliente = ?";
    $types .= "i";
    $values[] = $id_cliente;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
    
    if ($stmt->execute()) {
        // Obtener cliente actualizado
        $getStmt = $conn->prepare("SELECT * FROM CLIENTE WHERE id_cliente = ?");
        $getStmt->bind_param("i", $id_cliente);
        $getStmt->execute();
        $cliente = $getStmt->get_result()->fetch_assoc();
        
        respond(true, 'Cliente actualizado exitosamente', $cliente);
    } else {
        respond(false, 'Error al actualizar cliente: ' . $conn->error);
    }
}

// =====================================================
// ELIMINAR CLIENTE
// =====================================================
function deleteCliente() {
    global $conn;
    
    // Obtener ID de la URL
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if (!$id) {
        respond(false, 'ID de cliente requerido');
    }
    
    // Verificar si tiene pedidos
    $checkSql = "SELECT COUNT(*) as total FROM PEDIDO WHERE id_cliente = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['total'] > 0) {
        respond(false, 'No se puede eliminar el cliente porque tiene pedidos asociados');
    }
    
    // Eliminar cliente
    $sql = "DELETE FROM CLIENTE WHERE id_cliente = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            respond(true, 'Cliente eliminado exitosamente');
        } else {
            respond(false, 'Cliente no encontrado');
        }
    } else {
        respond(false, 'Error al eliminar cliente: ' . $conn->error);
    }
}
?>
