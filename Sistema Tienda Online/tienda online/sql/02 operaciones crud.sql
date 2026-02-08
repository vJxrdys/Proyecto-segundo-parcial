-- =====================================================
-- OPERACIONES CRUD - TIENDA EN LÍNEA
-- Ejemplos de Create, Read, Update, Delete
-- =====================================================

-- =====================================================
-- CREATE (INSERCIÓN DE DATOS)
-- =====================================================

-- Insertar un nuevo cliente
INSERT INTO CLIENTE (nombre, apellido, email, telefono, direccion, ciudad, pais, codigo_postal)
VALUES ('Pedro', 'Sánchez', 'pedro.sanchez@email.com', '0995551234', 'Calle Nueva 999', 'Ambato', 'Ecuador', '180101');

-- Insertar una nueva categoría
INSERT INTO CATEGORIA (nombre_categoria, descripcion)
VALUES ('Mascotas', 'Productos para el cuidado de mascotas');

-- Insertar un nuevo producto
INSERT INTO PRODUCTO (id_categoria, nombre_producto, descripcion, precio, stock, imagen_url)
VALUES (7, 'Comida para Perros Premium', 'Alimento balanceado para perros adultos, 15kg', 45.99, 50, 'https://ejemplo.com/comida-perros.jpg');

-- Insertar un nuevo pedido
INSERT INTO PEDIDO (id_cliente, id_estado, id_metodo_pago, total, notas)
VALUES (6, 1, 1, 45.99, 'Primera compra del cliente');

-- Insertar detalle del pedido
INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
VALUES (6, 25, 1, 45.99, 45.99);


-- =====================================================
-- READ (CONSULTAS DE LECTURA)
-- =====================================================

-- 1. Consulta simple: Obtener todos los clientes
SELECT * FROM CLIENTE;

-- 2. Consulta con filtro: Clientes de Guayaquil
SELECT nombre, apellido, email, telefono
FROM CLIENTE
WHERE ciudad = 'Guayaquil';

-- 3. Consulta con ORDER BY: Productos ordenados por precio descendente
SELECT nombre_producto, precio, stock
FROM PRODUCTO
WHERE activo = TRUE
ORDER BY precio DESC;

-- 4. Consulta con JOIN: Productos con su categoría
SELECT 
    p.nombre_producto,
    p.precio,
    p.stock,
    c.nombre_categoria
FROM PRODUCTO p
INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
ORDER BY c.nombre_categoria, p.nombre_producto;

-- 5. Consulta compleja: Pedidos con detalles del cliente y estado
SELECT 
    ped.id_pedido,
    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
    cli.email,
    ped.fecha_pedido,
    ped.total,
    est.nombre_estado,
    mp.nombre_metodo
FROM PEDIDO ped
INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
INNER JOIN METODO_PAGO mp ON ped.id_metodo_pago = mp.id_metodo_pago
ORDER BY ped.fecha_pedido DESC;

-- 6. Consulta con múltiples JOINs: Detalle completo de pedidos
SELECT 
    ped.id_pedido,
    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
    prod.nombre_producto,
    det.cantidad,
    det.precio_unitario,
    det.subtotal,
    est.nombre_estado,
    ped.fecha_pedido
FROM DETALLE_PEDIDO det
INNER JOIN PEDIDO ped ON det.id_pedido = ped.id_pedido
INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
INNER JOIN PRODUCTO prod ON det.id_producto = prod.id_producto
INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
ORDER BY ped.id_pedido, det.id_detalle;

-- 7. Consulta con agregación: Total de ventas por categoría
SELECT 
    c.nombre_categoria,
    COUNT(det.id_detalle) AS total_productos_vendidos,
    SUM(det.subtotal) AS total_ventas
FROM CATEGORIA c
INNER JOIN PRODUCTO p ON c.id_categoria = p.id_categoria
INNER JOIN DETALLE_PEDIDO det ON p.id_producto = det.id_producto
GROUP BY c.id_categoria, c.nombre_categoria
ORDER BY total_ventas DESC;

-- 8. Productos más vendidos
SELECT 
    p.nombre_producto,
    SUM(det.cantidad) AS total_vendido,
    SUM(det.subtotal) AS ingresos_totales
FROM PRODUCTO p
INNER JOIN DETALLE_PEDIDO det ON p.id_producto = det.id_producto
GROUP BY p.id_producto, p.nombre_producto
ORDER BY total_vendido DESC
LIMIT 10;

-- 9. Clientes con más pedidos
SELECT 
    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
    c.email,
    COUNT(ped.id_pedido) AS total_pedidos,
    SUM(ped.total) AS total_gastado
FROM CLIENTE c
INNER JOIN PEDIDO ped ON c.id_cliente = ped.id_cliente
GROUP BY c.id_cliente, c.nombre, c.apellido, c.email
ORDER BY total_pedidos DESC;

-- 10. Productos con bajo stock (menos de 20 unidades)
SELECT 
    p.nombre_producto,
    c.nombre_categoria,
    p.stock,
    p.precio
FROM PRODUCTO p
INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
WHERE p.stock < 20 AND p.activo = TRUE
ORDER BY p.stock ASC;

-- 11. Pedidos pendientes de entrega
SELECT 
    ped.id_pedido,
    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
    cli.telefono,
    cli.direccion,
    cli.ciudad,
    ped.total,
    est.nombre_estado,
    ped.fecha_pedido
FROM PEDIDO ped
INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
WHERE est.nombre_estado IN ('Pendiente', 'Procesando', 'Enviado')
ORDER BY ped.fecha_pedido ASC;

-- 12. Reporte de ventas por método de pago
SELECT 
    mp.nombre_metodo,
    COUNT(ped.id_pedido) AS total_pedidos,
    SUM(ped.total) AS total_ventas
FROM METODO_PAGO mp
INNER JOIN PEDIDO ped ON mp.id_metodo_pago = ped.id_metodo_pago
GROUP BY mp.id_metodo_pago, mp.nombre_metodo
ORDER BY total_ventas DESC;


-- =====================================================
-- UPDATE (ACTUALIZACIÓN DE DATOS)
-- =====================================================

-- Actualizar información de un cliente
UPDATE CLIENTE
SET telefono = '0991112233',
    direccion = 'Nueva Dirección 456'
WHERE id_cliente = 1;

-- Actualizar precio de un producto
UPDATE PRODUCTO
SET precio = 849.99
WHERE id_producto = 1;

-- Actualizar stock después de una venta
UPDATE PRODUCTO
SET stock = stock - 1
WHERE id_producto = 3;

-- Cambiar estado de un pedido
UPDATE PEDIDO
SET id_estado = 3  -- Enviado
WHERE id_pedido = 4;

-- Desactivar un producto
UPDATE PRODUCTO
SET activo = FALSE
WHERE id_producto = 12;

-- Actualizar múltiples productos de una categoría (aumentar precio 10%)
UPDATE PRODUCTO
SET precio = precio * 1.10
WHERE id_categoria = 1 AND activo = TRUE;


-- =====================================================
-- DELETE (ELIMINACIÓN DE DATOS)
-- =====================================================

-- Eliminar un cliente (solo si no tiene pedidos asociados)
-- Esta operación fallará si hay pedidos por la restricción FOREIGN KEY
DELETE FROM CLIENTE
WHERE id_cliente = 10;

-- Eliminar un producto (solo si no está en pedidos)
DELETE FROM PRODUCTO
WHERE id_producto = 50;

-- Eliminar detalles de un pedido cancelado
DELETE FROM DETALLE_PEDIDO
WHERE id_pedido = 15;

-- Eliminar un pedido completo
DELETE FROM PEDIDO
WHERE id_pedido = 15;

-- Eliminar categorías sin productos
DELETE FROM CATEGORIA
WHERE id_categoria NOT IN (SELECT DISTINCT id_categoria FROM PRODUCTO);


-- =====================================================
-- CONSULTAS AVANZADAS CON SUBCONSULTAS
-- =====================================================

-- Productos con precio superior al promedio
SELECT 
    nombre_producto,
    precio,
    stock
FROM PRODUCTO
WHERE precio > (SELECT AVG(precio) FROM PRODUCTO)
ORDER BY precio DESC;

-- Clientes que nunca han realizado un pedido
SELECT 
    CONCAT(nombre, ' ', apellido) AS cliente,
    email,
    fecha_registro
FROM CLIENTE
WHERE id_cliente NOT IN (SELECT DISTINCT id_cliente FROM PEDIDO);

-- Categorías con más productos
SELECT 
    c.nombre_categoria,
    COUNT(p.id_producto) AS total_productos
FROM CATEGORIA c
LEFT JOIN PRODUCTO p ON c.id_categoria = p.id_categoria
GROUP BY c.id_categoria, c.nombre_categoria
ORDER BY total_productos DESC;


-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Resumen de productos
CREATE OR REPLACE VIEW vista_productos_resumen AS
SELECT 
    p.id_producto,
    p.nombre_producto,
    c.nombre_categoria,
    p.precio,
    p.stock,
    p.activo,
    CASE 
        WHEN p.stock = 0 THEN 'Sin Stock'
        WHEN p.stock < 10 THEN 'Stock Bajo'
        WHEN p.stock < 30 THEN 'Stock Medio'
        ELSE 'Stock Alto'
    END AS nivel_stock
FROM PRODUCTO p
INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria;

-- Vista: Historial de pedidos de clientes
CREATE OR REPLACE VIEW vista_historial_pedidos AS
SELECT 
    ped.id_pedido,
    cli.id_cliente,
    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
    cli.email,
    ped.fecha_pedido,
    ped.total,
    est.nombre_estado,
    mp.nombre_metodo
FROM PEDIDO ped
INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
INNER JOIN METODO_PAGO mp ON ped.id_metodo_pago = mp.id_metodo_pago;

-- Usar las vistas
SELECT * FROM vista_productos_resumen WHERE activo = TRUE;
SELECT * FROM vista_historial_pedidos WHERE cliente LIKE '%Juan%';


-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para crear un nuevo pedido
DELIMITER //
CREATE PROCEDURE crear_pedido(
    IN p_id_cliente INT,
    IN p_id_metodo_pago INT,
    IN p_notas TEXT
)
BEGIN
    INSERT INTO PEDIDO (id_cliente, id_estado, id_metodo_pago, total, notas)
    VALUES (p_id_cliente, 1, p_id_metodo_pago, 0, p_notas);
    
    SELECT LAST_INSERT_ID() AS nuevo_id_pedido;
END //
DELIMITER ;

-- Procedimiento para agregar producto a un pedido
DELIMITER //
CREATE PROCEDURE agregar_producto_pedido(
    IN p_id_pedido INT,
    IN p_id_producto INT,
    IN p_cantidad INT
)
BEGIN
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_subtotal DECIMAL(10,2);
    
    -- Obtener precio del producto
    SELECT precio INTO v_precio FROM PRODUCTO WHERE id_producto = p_id_producto;
    
    -- Calcular subtotal
    SET v_subtotal = v_precio * p_cantidad;
    
    -- Insertar detalle
    INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
    VALUES (p_id_pedido, p_id_producto, p_cantidad, v_precio, v_subtotal);
    
    -- Actualizar total del pedido
    UPDATE PEDIDO
    SET total = (SELECT SUM(subtotal) FROM DETALLE_PEDIDO WHERE id_pedido = p_id_pedido)
    WHERE id_pedido = p_id_pedido;
    
    -- Reducir stock
    UPDATE PRODUCTO
    SET stock = stock - p_cantidad
    WHERE id_producto = p_id_producto;
END //
DELIMITER ;

-- =====================================================
-- FIN DE OPERACIONES CRUD
-- =====================================================
