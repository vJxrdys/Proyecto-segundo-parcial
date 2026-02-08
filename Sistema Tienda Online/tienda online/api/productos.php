<?php
// =====================================================
// API PARA GESTIÓN DE PRODUCTOS
// =====================================================

require_once 'config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getProductos();
        break;
    case 'POST':
        createProducto();
        break;
    case 'PUT':
        updateProducto();
        break;
    case 'DELETE':
        deleteProducto();
        break;
    default:
        respond(false, 'Método no permitido');
}

// =====================================================
// OBTENER PRODUCTOS
// =====================================================
function getProductos() {
    global $conn;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $categoria = isset($_GET['categoria']) ? intval($_GET['categoria']) : null;
    
    if ($id) {
        $sql = "SELECT p.*, c.nombre_categoria 
                FROM PRODUCTO p 
                INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria 
                WHERE p.id_producto = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            respond(true, 'Producto encontrado', $result->fetch_assoc());
        } else {
            respond(false, 'Producto no encontrado');
        }
    } else {
        $sql = "SELECT p.*, c.nombre_categoria 
                FROM PRODUCTO p 
                INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria";
        
        if ($categoria) {
            $sql .= " WHERE p.id_categoria = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $categoria);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql .= " ORDER BY p.fecha_agregado DESC";
            $result = $conn->query($sql);
        }
        
        $productos = [];
        while ($row = $result->fetch_assoc()) {
            $productos[] = $row;
        }
        
        respond(true, 'Productos obtenidos', $productos);
    }
}

// =====================================================
// CREAR PRODUCTO
// =====================================================
function createProducto() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['nombre_producto']) || empty($data['id_categoria']) || !isset($data['precio']) || !isset($data['stock'])) {
        respond(false, 'Nombre, categoría, precio y stock son obligatorios');
    }
    
    if ($data['precio'] < 0) {
        respond(false, 'El precio no puede ser negativo');
    }
    
    if ($data['stock'] < 0) {
        respond(false, 'El stock no puede ser negativo');
    }
    
    $nombre = sanitize($conn, $data['nombre_producto']);
    $id_categoria = intval($data['id_categoria']);
    $descripcion = isset($data['descripcion']) ? sanitize($conn, $data['descripcion']) : null;
    $precio = floatval($data['precio']);
    $stock = intval($data['stock']);
    $imagen_url = isset($data['imagen_url']) ? sanitize($conn, $data['imagen_url']) : null;
    
    $sql = "INSERT INTO PRODUCTO (id_categoria, nombre_producto, descripcion, precio, stock, imagen_url) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issdis", $id_categoria, $nombre, $descripcion, $precio, $stock, $imagen_url);
    
    if ($stmt->execute()) {
        $id_producto = $conn->insert_id;
        
        $getStmt = $conn->prepare("SELECT p.*, c.nombre_categoria 
                                   FROM PRODUCTO p 
                                   INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria 
                                   WHERE p.id_producto = ?");
        $getStmt->bind_param("i", $id_producto);
        $getStmt->execute();
        $producto = $getStmt->get_result()->fetch_assoc();
        
        respond(true, 'Producto creado exitosamente', $producto);
    } else {
        respond(false, 'Error al crear producto: ' . $conn->error);
    }
}

// =====================================================
// ACTUALIZAR PRODUCTO
// =====================================================
function updateProducto() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id_producto'])) {
        respond(false, 'ID de producto requerido');
    }
    
    $id_producto = intval($data['id_producto']);
    
    $updates = [];
    $types = "";
    $values = [];
    
    if (isset($data['nombre_producto'])) {
        $updates[] = "nombre_producto = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['nombre_producto']);
    }
    if (isset($data['id_categoria'])) {
        $updates[] = "id_categoria = ?";
        $types .= "i";
        $values[] = intval($data['id_categoria']);
    }
    if (isset($data['descripcion'])) {
        $updates[] = "descripcion = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['descripcion']);
    }
    if (isset($data['precio'])) {
        $updates[] = "precio = ?";
        $types .= "d";
        $values[] = floatval($data['precio']);
    }
    if (isset($data['stock'])) {
        $updates[] = "stock = ?";
        $types .= "i";
        $values[] = intval($data['stock']);
    }
    if (isset($data['imagen_url'])) {
        $updates[] = "imagen_url = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['imagen_url']);
    }
    if (isset($data['activo'])) {
        $updates[] = "activo = ?";
        $types .= "i";
        $values[] = $data['activo'] ? 1 : 0;
    }
    
    if (empty($updates)) {
        respond(false, 'No hay datos para actualizar');
    }
    
    $sql = "UPDATE PRODUCTO SET " . implode(", ", $updates) . " WHERE id_producto = ?";
    $types .= "i";
    $values[] = $id_producto;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
    
    if ($stmt->execute()) {
        $getStmt = $conn->prepare("SELECT p.*, c.nombre_categoria 
                                   FROM PRODUCTO p 
                                   INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria 
                                   WHERE p.id_producto = ?");
        $getStmt->bind_param("i", $id_producto);
        $getStmt->execute();
        $producto = $getStmt->get_result()->fetch_assoc();
        
        respond(true, 'Producto actualizado exitosamente', $producto);
    } else {
        respond(false, 'Error al actualizar producto: ' . $conn->error);
    }
}

// =====================================================
// ELIMINAR PRODUCTO
// =====================================================
function deleteProducto() {
    global $conn;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if (!$id) {
        respond(false, 'ID de producto requerido');
    }
    
    // Verificar si está en pedidos
    $checkSql = "SELECT COUNT(*) as total FROM DETALLE_PEDIDO WHERE id_producto = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['total'] > 0) {
        respond(false, 'No se puede eliminar el producto porque está en pedidos');
    }
    
    $sql = "DELETE FROM PRODUCTO WHERE id_producto = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            respond(true, 'Producto eliminado exitosamente');
        } else {
            respond(false, 'Producto no encontrado');
        }
    } else {
        respond(false, 'Error al eliminar producto: ' . $conn->error);
    }
}
?>
