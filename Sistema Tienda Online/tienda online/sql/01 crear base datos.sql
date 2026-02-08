-- =====================================================
-- PROYECTO: BASE DE DATOS TIENDA EN LÍNEA
-- Sistema Gestor: MySQL/PostgreSQL
-- Autor: Proyecto Modelamiento
-- Fecha: 2026-02-04
-- =====================================================

-- Crear la base de datos
DROP DATABASE IF EXISTS tienda_online;
CREATE DATABASE tienda_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tienda_online;

-- =====================================================
-- TABLA: CLIENTE
-- Descripción: Almacena información de los clientes
-- =====================================================
CREATE TABLE CLIENTE (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    codigo_postal VARCHAR(10),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_nombre (nombre, apellido)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: CATEGORIA
-- Descripción: Categorías de productos
-- =====================================================
CREATE TABLE CATEGORIA (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    INDEX idx_nombre_categoria (nombre_categoria)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: PRODUCTO
-- Descripción: Catálogo de productos disponibles
-- =====================================================
CREATE TABLE PRODUCTO (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre_producto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url VARCHAR(500),
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_categoria (id_categoria),
    INDEX idx_nombre_producto (nombre_producto),
    INDEX idx_precio (precio),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: ESTADO_PEDIDO
-- Descripción: Estados posibles de un pedido
-- =====================================================
CREATE TABLE ESTADO_PEDIDO (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    INDEX idx_nombre_estado (nombre_estado)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: METODO_PAGO
-- Descripción: Métodos de pago disponibles
-- =====================================================
CREATE TABLE METODO_PAGO (
    id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY,
    nombre_metodo VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    INDEX idx_nombre_metodo (nombre_metodo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: PEDIDO
-- Descripción: Pedidos realizados por clientes
-- =====================================================
CREATE TABLE PEDIDO (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_estado INT NOT NULL,
    id_metodo_pago INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    notas TEXT,
    FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_estado) REFERENCES ESTADO_PEDIDO(id_estado) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_metodo_pago) REFERENCES METODO_PAGO(id_metodo_pago) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_cliente (id_cliente),
    INDEX idx_estado (id_estado),
    INDEX idx_fecha (fecha_pedido)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: DETALLE_PEDIDO
-- Descripción: Detalles de productos en cada pedido
-- =====================================================
CREATE TABLE DETALLE_PEDIDO (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pedido (id_pedido),
    INDEX idx_producto (id_producto)
) ENGINE=InnoDB;

-- =====================================================
-- DATOS INICIALES: CATEGORÍAS
-- =====================================================
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES
('Electrónica', 'Dispositivos electrónicos y accesorios'),
('Ropa', 'Prendas de vestir para hombre, mujer y niños'),
('Hogar', 'Artículos para el hogar y decoración'),
('Deportes', 'Equipamiento deportivo y fitness'),
('Libros', 'Libros físicos y digitales'),
('Juguetes', 'Juguetes y juegos para todas las edades');

-- =====================================================
-- DATOS INICIALES: ESTADOS DE PEDIDO
-- =====================================================
INSERT INTO ESTADO_PEDIDO (nombre_estado, descripcion) VALUES
('Pendiente', 'Pedido recibido, esperando procesamiento'),
('Procesando', 'Pedido en preparación'),
('Enviado', 'Pedido enviado al cliente'),
('Entregado', 'Pedido entregado exitosamente'),
('Cancelado', 'Pedido cancelado');

-- =====================================================
-- DATOS INICIALES: MÉTODOS DE PAGO
-- =====================================================
INSERT INTO METODO_PAGO (nombre_metodo, descripcion) VALUES
('Tarjeta de Crédito', 'Pago con tarjeta de crédito'),
('Tarjeta de Débito', 'Pago con tarjeta de débito'),
('PayPal', 'Pago a través de PayPal'),
('Transferencia Bancaria', 'Transferencia bancaria directa'),
('Contra Entrega', 'Pago al recibir el producto');

-- =====================================================
-- DATOS DE EJEMPLO: CLIENTES
-- =====================================================
INSERT INTO CLIENTE (nombre, apellido, email, telefono, direccion, ciudad, pais, codigo_postal) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '0991234567', 'Av. Principal 123', 'Guayaquil', 'Ecuador', '090101'),
('María', 'González', 'maria.gonzalez@email.com', '0987654321', 'Calle Secundaria 456', 'Quito', 'Ecuador', '170101'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '0998765432', 'Av. Los Ríos 789', 'Cuenca', 'Ecuador', '010101'),
('Ana', 'Martínez', 'ana.martinez@email.com', '0993456789', 'Calle Las Flores 321', 'Guayaquil', 'Ecuador', '090102'),
('Luis', 'Fernández', 'luis.fernandez@email.com', '0996543210', 'Av. Central 654', 'Quito', 'Ecuador', '170102');

-- =====================================================
-- DATOS DE EJEMPLO: PRODUCTOS
-- =====================================================
INSERT INTO PRODUCTO (id_categoria, nombre_producto, descripcion, precio, stock, imagen_url) VALUES
-- Electrónica
(1, 'Laptop HP 15.6"', 'Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD', 899.99, 15, 'https://ejemplo.com/laptop-hp.jpg'),
(1, 'Mouse Inalámbrico Logitech', 'Mouse inalámbrico ergonómico con batería de larga duración', 25.50, 50, 'https://ejemplo.com/mouse-logitech.jpg'),
(1, 'Audífonos Bluetooth Sony', 'Audífonos con cancelación de ruido y 30 horas de batería', 149.99, 30, 'https://ejemplo.com/audifonos-sony.jpg'),
(1, 'Teclado Mecánico RGB', 'Teclado mecánico con iluminación RGB personalizable', 79.99, 25, 'https://ejemplo.com/teclado-mecanico.jpg'),

-- Ropa
(2, 'Camiseta Polo Lacoste', 'Camiseta polo 100% algodón, disponible en varios colores', 45.00, 100, 'https://ejemplo.com/polo-lacoste.jpg'),
(2, 'Jeans Levis 501', 'Jeans clásicos de mezclilla resistente', 69.99, 75, 'https://ejemplo.com/jeans-levis.jpg'),
(2, 'Zapatillas Nike Air Max', 'Zapatillas deportivas con tecnología Air Max', 120.00, 40, 'https://ejemplo.com/nike-air.jpg'),
(2, 'Chaqueta North Face', 'Chaqueta impermeable para actividades al aire libre', 180.00, 20, 'https://ejemplo.com/chaqueta-north.jpg'),

-- Hogar
(3, 'Juego de Sábanas Queen', 'Juego de sábanas 100% algodón egipcio', 55.00, 60, 'https://ejemplo.com/sabanas-queen.jpg'),
(3, 'Cafetera Nespresso', 'Cafetera de cápsulas con sistema de presión', 199.99, 18, 'https://ejemplo.com/cafetera-nespresso.jpg'),
(3, 'Lámpara de Mesa LED', 'Lámpara LED regulable con puerto USB', 35.50, 45, 'https://ejemplo.com/lampara-led.jpg'),
(3, 'Aspiradora Roomba', 'Robot aspiradora con mapeo inteligente', 399.99, 12, 'https://ejemplo.com/roomba.jpg'),

-- Deportes
(4, 'Pelota de Fútbol Adidas', 'Pelota oficial de fútbol, tamaño 5', 29.99, 80, 'https://ejemplo.com/pelota-adidas.jpg'),
(4, 'Pesas Ajustables 20kg', 'Set de pesas ajustables para ejercicio en casa', 89.99, 30, 'https://ejemplo.com/pesas-ajustables.jpg'),
(4, 'Colchoneta de Yoga', 'Colchoneta antideslizante de 6mm de grosor', 25.00, 55, 'https://ejemplo.com/colchoneta-yoga.jpg'),
(4, 'Bicicleta de Montaña', 'Bicicleta de montaña con 21 velocidades', 450.00, 10, 'https://ejemplo.com/bici-montana.jpg'),

-- Libros
(5, 'Cien Años de Soledad', 'Novela de Gabriel García Márquez', 15.99, 100, 'https://ejemplo.com/cien-anos.jpg'),
(5, 'El Principito', 'Clásico de Antoine de Saint-Exupéry', 12.50, 120, 'https://ejemplo.com/principito.jpg'),
(5, 'Harry Potter - Colección', 'Colección completa de 7 libros', 89.99, 25, 'https://ejemplo.com/harry-potter.jpg'),
(5, 'Sapiens', 'De animales a dioses - Yuval Noah Harari', 22.00, 40, 'https://ejemplo.com/sapiens.jpg'),

-- Juguetes
(6, 'LEGO Star Wars', 'Set de construcción LEGO con 500 piezas', 65.00, 35, 'https://ejemplo.com/lego-starwars.jpg'),
(6, 'Monopoly Clásico', 'Juego de mesa para toda la familia', 28.99, 50, 'https://ejemplo.com/monopoly.jpg'),
(6, 'Muñeca Barbie', 'Muñeca Barbie con accesorios', 19.99, 70, 'https://ejemplo.com/barbie.jpg'),
(6, 'Control Remoto Carro', 'Carro a control remoto con batería recargable', 45.50, 40, 'https://ejemplo.com/carro-rc.jpg');

-- =====================================================
-- DATOS DE EJEMPLO: PEDIDOS
-- =====================================================
INSERT INTO PEDIDO (id_cliente, id_estado, id_metodo_pago, total, notas) VALUES
(1, 3, 1, 925.49, 'Entregar en la tarde'),
(2, 4, 3, 215.00, NULL),
(3, 2, 2, 89.99, 'Llamar antes de entregar'),
(4, 1, 1, 149.99, NULL),
(5, 3, 4, 450.00, 'Envío urgente');

-- =====================================================
-- DATOS DE EJEMPLO: DETALLES DE PEDIDO
-- =====================================================
INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
-- Pedido 1
(1, 1, 1, 899.99, 899.99),
(1, 2, 1, 25.50, 25.50),

-- Pedido 2
(2, 7, 1, 120.00, 120.00),
(2, 13, 1, 29.99, 29.99),
(2, 18, 1, 15.99, 15.99),
(2, 6, 1, 69.99, 69.99),

-- Pedido 3
(3, 14, 1, 89.99, 89.99),

-- Pedido 4
(4, 3, 1, 149.99, 149.99),

-- Pedido 5
(5, 16, 1, 450.00, 450.00);

-- =====================================================
-- FIN DE LA CREACIÓN DE LA BASE DE DATOS
-- =====================================================
