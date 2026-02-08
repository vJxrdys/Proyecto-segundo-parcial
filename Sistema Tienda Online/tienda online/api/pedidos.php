<?php
// =====================================================
// API PARA GESTIÓN DE PEDIDOS
// =====================================================

require_once 'config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getPedidos();
        break;
    case 'POST':
        createPedido();
        break;
    case 'PUT':
        updatePedido();
        break;
    case 'DELETE':
        deletePedido();
        break;
    default:
        respond(false, 'Método no permitido');
}

// =====================================================
// OBTENER PEDIDOS
// =====================================================
function getPedidos() {
    global $conn;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if ($id) {
        $sql = "SELECT 
                    ped.*,
                    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
                    cli.email,
                    est.nombre_estado,
                    mp.nombre_metodo
                FROM PEDIDO ped
                INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
                INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
                INNER JOIN METODO_PAGO mp ON ped.id_metodo_pago = mp.id_metodo_pago
                WHERE ped.id_pedido = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $pedido = $result->fetch_assoc();
            
            // Obtener detalles del pedido
            $detalleSql = "SELECT 
                            det.*,
                            prod.nombre_producto
                          FROM DETALLE_PEDIDO det
                          INNER JOIN PRODUCTO prod ON det.id_producto = prod.id_producto
                          WHERE det.id_pedido = ?";
            $stmtDetalle = $conn->prepare($detalleSql);
            $stmtDetalle->bind_param("i", $id);
            $stmtDetalle->execute();
            $detalleResult = $stmtDetalle->get_result();
            
            $detalles = [];
            while ($row = $detalleResult->fetch_assoc()) {
                $detalles[] = $row;
            }
            
            $pedido['detalles'] = $detalles;
            
            respond(true, 'Pedido encontrado', $pedido);
        } else {
            respond(false, 'Pedido no encontrado');
        }
    } else {
        $sql = "SELECT 
                    ped.id_pedido,
                    ped.fecha_pedido,
                    ped.total,
                    ped.notas,
                    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
                    est.nombre_estado,
                    mp.nombre_metodo
                FROM PEDIDO ped
                INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
                INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
                INNER JOIN METODO_PAGO mp ON ped.id_metodo_pago = mp.id_metodo_pago
                ORDER BY ped.fecha_pedido DESC";
        
        $result = $conn->query($sql);
        
        $pedidos = [];
        while ($row = $result->fetch_assoc()) {
            $pedidos[] = $row;
        }
        
        respond(true, 'Pedidos obtenidos', $pedidos);
    }
}

// =====================================================
// CREAR PEDIDO
// =====================================================
function createPedido() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id_cliente']) || empty($data['id_metodo_pago']) || empty($data['productos'])) {
        respond(false, 'Cliente, método de pago y productos son obligatorios');
    }
    
    // Iniciar transacción
    $conn->begin_transaction();
    
    try {
        $id_cliente = intval($data['id_cliente']);
        $id_estado = isset($data['id_estado']) ? intval($data['id_estado']) : 1; // 1 = Pendiente
        $id_metodo_pago = intval($data['id_metodo_pago']);
        $notas = isset($data['notas']) ? sanitize($conn, $data['notas']) : null;
        
        // Crear el pedido con total inicial 0
        $sql = "INSERT INTO PEDIDO (id_cliente, id_estado, id_metodo_pago, total, notas) 
                VALUES (?, ?, ?, 0, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiis", $id_cliente, $id_estado, $id_metodo_pago, $notas);
        $stmt->execute();
        
        $id_pedido = $conn->insert_id;
        $total = 0;
        
        // Agregar productos al pedido
        foreach ($data['productos'] as $producto) {
            $id_producto = intval($producto['id_producto']);
            $cantidad = intval($producto['cantidad']);
            
            // Obtener precio actual del producto
            $precioSql = "SELECT precio, stock FROM PRODUCTO WHERE id_producto = ?";
            $precioStmt = $conn->prepare($precioSql);
            $precioStmt->bind_param("i", $id_producto);
            $precioStmt->execute();
            $precioResult = $precioStmt->get_result();
            
            if ($precioResult->num_rows === 0) {
                throw new Exception("Producto ID $id_producto no encontrado");
            }
            
            $productoData = $precioResult->fetch_assoc();
            $precio_unitario = $productoData['precio'];
            $stock_disponible = $productoData['stock'];
            
            if ($stock_disponible < $cantidad) {
                throw new Exception("Stock insuficiente para producto ID $id_producto");
            }
            
            $subtotal = $precio_unitario * $cantidad;
            $total += $subtotal;
            
            // Insertar detalle del pedido
            $detalleSql = "INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal) 
                          VALUES (?, ?, ?, ?, ?)";
            $detalleStmt = $conn->prepare($detalleSql);
            $detalleStmt->bind_param("iiidd", $id_pedido, $id_producto, $cantidad, $precio_unitario, $subtotal);
            $detalleStmt->execute();
            
            // Actualizar stock
            $updateStockSql = "UPDATE PRODUCTO SET stock = stock - ? WHERE id_producto = ?";
            $updateStockStmt = $conn->prepare($updateStockSql);
            $updateStockStmt->bind_param("ii", $cantidad, $id_producto);
            $updateStockStmt->execute();
        }
        
        // Actualizar el total del pedido
        $updateTotalSql = "UPDATE PEDIDO SET total = ? WHERE id_pedido = ?";
        $updateTotalStmt = $conn->prepare($updateTotalSql);
        $updateTotalStmt->bind_param("di", $total, $id_pedido);
        $updateTotalStmt->execute();
        
        // Confirmar transacción
        $conn->commit();
        
        // Obtener el pedido completo
        $getPedidoSql = "SELECT 
                            ped.*,
                            CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
                            est.nombre_estado,
                            mp.nombre_metodo
                        FROM PEDIDO ped
                        INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
                        INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
                        INNER JOIN METODO_PAGO mp ON ped.id_metodo_pago = mp.id_metodo_pago
                        WHERE ped.id_pedido = ?";
        $getPedidoStmt = $conn->prepare($getPedidoSql);
        $getPedidoStmt->bind_param("i", $id_pedido);
        $getPedidoStmt->execute();
        $pedido = $getPedidoStmt->get_result()->fetch_assoc();
        
        respond(true, 'Pedido creado exitosamente', $pedido);
        
    } catch (Exception $e) {
        $conn->rollback();
        respond(false, 'Error al crear pedido: ' . $e->getMessage());
    }
}

// =====================================================
// ACTUALIZAR PEDIDO
// =====================================================
function updatePedido() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id_pedido'])) {
        respond(false, 'ID de pedido requerido');
    }
    
    $id_pedido = intval($data['id_pedido']);
    
    $updates = [];
    $types = "";
    $values = [];
    
    if (isset($data['id_estado'])) {
        $updates[] = "id_estado = ?";
        $types .= "i";
        $values[] = intval($data['id_estado']);
    }
    if (isset($data['notas'])) {
        $updates[] = "notas = ?";
        $types .= "s";
        $values[] = sanitize($conn, $data['notas']);
    }
    
    if (empty($updates)) {
        respond(false, 'No hay datos para actualizar');
    }
    
    $sql = "UPDATE PEDIDO SET " . implode(", ", $updates) . " WHERE id_pedido = ?";
    $types .= "i";
    $values[] = $id_pedido;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
    
    if ($stmt->execute()) {
        $getStmt = $conn->prepare("SELECT 
                                    ped.*,
                                    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
                                    est.nombre_estado,
                                    mp.nombre_metodo
                                   FROM PEDIDO ped
                                   INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
                                   INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
                                   INNER JOIN METODO_PAGO mp ON ped.id_metodo_pago = mp.id_metodo_pago
                                   WHERE ped.id_pedido = ?");
        $getStmt->bind_param("i", $id_pedido);
        $getStmt->execute();
        $pedido = $getStmt->get_result()->fetch_assoc();
        
        respond(true, 'Pedido actualizado exitosamente', $pedido);
    } else {
        respond(false, 'Error al actualizar pedido: ' . $conn->error);
    }
}

// =====================================================
// ELIMINAR PEDIDO
// =====================================================
function deletePedido() {
    global $conn;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if (!$id) {
        respond(false, 'ID de pedido requerido');
    }
    
    // Iniciar transacción
    $conn->begin_transaction();
    
    try {
        // Obtener productos del pedido para restaurar stock
        $detallesSql = "SELECT id_producto, cantidad FROM DETALLE_PEDIDO WHERE id_pedido = ?";
        $detallesStmt = $conn->prepare($detallesSql);
        $detallesStmt->bind_param("i", $id);
        $detallesStmt->execute();
        $detallesResult = $detallesStmt->get_result();
        
        // Restaurar stock
        while ($detalle = $detallesResult->fetch_assoc()) {
            $updateStockSql = "UPDATE PRODUCTO SET stock = stock + ? WHERE id_producto = ?";
            $updateStockStmt = $conn->prepare($updateStockSql);
            $updateStockStmt->bind_param("ii", $detalle['cantidad'], $detalle['id_producto']);
            $updateStockStmt->execute();
        }
        
        // Los detalles se eliminan automáticamente por CASCADE
        $sql = "DELETE FROM PEDIDO WHERE id_pedido = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            $conn->commit();
            respond(true, 'Pedido eliminado exitosamente');
        } else {
            $conn->rollback();
            respond(false, 'Pedido no encontrado');
        }
        
    } catch (Exception $e) {
        $conn->rollback();
        respond(false, 'Error al eliminar pedido: ' . $e->getMessage());
    }
}
?>
