// =====================================================
// JAVASCRIPT - SISTEMA DE GESTIÓN TIENDA EN LÍNEA
// =====================================================

// =====================================================
// NAVEGACIÓN DE TABS
// =====================================================

function showTab(tabName) {
    // Ocultar todos los contenidos
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Desactivar todos los tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Activar el tab seleccionado
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// =====================================================
// MANEJO DE FORMULARIOS
// =====================================================

// Formulario de Cliente
function initClienteForm() {
    const form = document.getElementById('formCliente');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Cliente agregado exitosamente.\n\nEn una implementación real, este formulario enviaría los datos a la base de datos.');
            this.reset();
        });
    }
}

// Formulario de Producto
function initProductoForm() {
    const form = document.getElementById('formProducto');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Producto agregado exitosamente.\n\nEn una implementación real, este formulario enviaría los datos a la base de datos.');
            this.reset();
        });
    }
}

// Formulario de Pedido
function initPedidoForm() {
    const form = document.getElementById('formPedido');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Pedido creado exitosamente.\n\nEn una implementación real, este formulario enviaría los datos a la base de datos.');
            this.reset();
        });
    }
}

// =====================================================
// GENERADORES DE SQL
// =====================================================

function generarSQLCliente() {
    const nombre = document.getElementById('nombreCliente').value || 'Juan';
    const apellido = document.getElementById('apellidoCliente').value || 'Pérez';
    const email = document.getElementById('emailCliente').value || 'juan.perez@email.com';
    const telefono = document.getElementById('telefonoCliente').value || '0991234567';
    const direccion = document.getElementById('direccionCliente').value || 'Av. Principal 123';
    const ciudad = document.getElementById('ciudadCliente').value || 'Guayaquil';
    const pais = document.getElementById('paisCliente').value || 'Ecuador';
    const codigo = document.getElementById('codigoPostalCliente').value || '090101';

    const sql = `INSERT INTO CLIENTE (nombre, apellido, email, telefono, direccion, ciudad, pais, codigo_postal)
VALUES ('${nombre}', '${apellido}', '${email}', '${telefono}', '${direccion}', '${ciudad}', '${pais}', '${codigo}');`;

    document.getElementById('codigoSQLCliente').textContent = sql;
    document.getElementById('sqlCliente').style.display = 'block';
}

function generarSQLProducto() {
    const nombre = document.getElementById('nombreProducto').value || 'Producto Ejemplo';
    const categoria = document.getElementById('categoriaProducto').value || '1';
    const descripcion = document.getElementById('descripcionProducto').value || 'Descripción del producto';
    const precio = document.getElementById('precioProducto').value || '99.99';
    const stock = document.getElementById('stockProducto').value || '50';
    const imagen = document.getElementById('imagenProducto').value || 'https://ejemplo.com/imagen.jpg';

    const sql = `INSERT INTO PRODUCTO (id_categoria, nombre_producto, descripcion, precio, stock, imagen_url)
VALUES (${categoria}, '${nombre}', '${descripcion}', ${precio}, ${stock}, '${imagen}');`;

    document.getElementById('codigoSQLProducto').textContent = sql;
    document.getElementById('sqlProducto').style.display = 'block';
}

function generarSQLPedido() {
    const cliente = document.getElementById('clientePedido').value || '1';
    const metodo = document.getElementById('metodoPago').value || '1';
    const notas = document.getElementById('notasPedido').value || 'Sin notas';

    const sql = `-- Crear el pedido
INSERT INTO PEDIDO (id_cliente, id_estado, id_metodo_pago, total, notas)
VALUES (${cliente}, 1, ${metodo}, 0, '${notas}');

-- Obtener el ID del pedido recién creado
SET @id_pedido = LAST_INSERT_ID();

-- Agregar productos al pedido (ejemplo)
INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
VALUES (@id_pedido, 1, 2, 899.99, 1799.98);

-- Actualizar el total del pedido
UPDATE PEDIDO 
SET total = (SELECT SUM(subtotal) FROM DETALLE_PEDIDO WHERE id_pedido = @id_pedido)
WHERE id_pedido = @id_pedido;`;

    document.getElementById('codigoSQLPedido').textContent = sql;
    document.getElementById('sqlPedido').style.display = 'block';
}

// =====================================================
// CONSULTAS SQL PREDEFINIDAS
// =====================================================

function mostrarConsulta(tipo) {
    let sql = '';
    let resultado = '';

    switch(tipo) {
        case 'productos-categoria':
            sql = `SELECT 
    p.nombre_producto,
    p.precio,
    p.stock,
    c.nombre_categoria
FROM PRODUCTO p
INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
ORDER BY c.nombre_categoria, p.nombre_producto;`;
            resultado = `<table>
                <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Categoría</th></tr></thead>
                <tbody>
                    <tr><td>Laptop HP 15.6"</td><td>$899.99</td><td>15</td><td>Electrónica</td></tr>
                    <tr><td>Mouse Logitech</td><td>$25.50</td><td>50</td><td>Electrónica</td></tr>
                    <tr><td>Camiseta Polo</td><td>$45.00</td><td>100</td><td>Ropa</td></tr>
                </tbody>
            </table>`;
            break;

        case 'ventas-categoria':
            sql = `SELECT 
    c.nombre_categoria,
    COUNT(det.id_detalle) AS productos_vendidos,
    SUM(det.subtotal) AS total_ventas
FROM CATEGORIA c
INNER JOIN PRODUCTO p ON c.id_categoria = p.id_categoria
INNER JOIN DETALLE_PEDIDO det ON p.id_producto = det.id_producto
GROUP BY c.id_categoria, c.nombre_categoria
ORDER BY total_ventas DESC;`;
            resultado = `<table>
                <thead><tr><th>Categoría</th><th>Productos Vendidos</th><th>Total Ventas</th></tr></thead>
                <tbody>
                    <tr><td>Electrónica</td><td>45</td><td>$8,456.00</td></tr>
                    <tr><td>Ropa</td><td>32</td><td>$3,245.00</td></tr>
                    <tr><td>Hogar</td><td>28</td><td>$2,890.00</td></tr>
                </tbody>
            </table>`;
            break;

        case 'clientes-pedidos':
            sql = `SELECT 
    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
    c.email,
    COUNT(ped.id_pedido) AS total_pedidos,
    SUM(ped.total) AS total_gastado
FROM CLIENTE c
INNER JOIN PEDIDO ped ON c.id_cliente = ped.id_cliente
GROUP BY c.id_cliente
ORDER BY total_pedidos DESC;`;
            resultado = `<table>
                <thead><tr><th>Cliente</th><th>Email</th><th>Total Pedidos</th><th>Total Gastado</th></tr></thead>
                <tbody>
                    <tr><td>Juan Pérez</td><td>juan.perez@email.com</td><td>5</td><td>$1,450.00</td></tr>
                    <tr><td>María González</td><td>maria.gonzalez@email.com</td><td>3</td><td>$890.00</td></tr>
                </tbody>
            </table>`;
            break;

        case 'productos-vendidos':
            sql = `SELECT 
    p.nombre_producto,
    SUM(det.cantidad) AS total_vendido,
    SUM(det.subtotal) AS ingresos
FROM PRODUCTO p
INNER JOIN DETALLE_PEDIDO det ON p.id_producto = det.id_producto
GROUP BY p.id_producto
ORDER BY total_vendido DESC
LIMIT 5;`;
            resultado = `<table>
                <thead><tr><th>Producto</th><th>Cantidad Vendida</th><th>Ingresos</th></tr></thead>
                <tbody>
                    <tr><td>Laptop HP 15.6"</td><td>12</td><td>$10,799.88</td></tr>
                    <tr><td>Audífonos Sony</td><td>8</td><td>$1,199.92</td></tr>
                    <tr><td>Zapatillas Nike</td><td>6</td><td>$720.00</td></tr>
                </tbody>
            </table>`;
            break;

        case 'stock-bajo':
            sql = `SELECT 
    p.nombre_producto,
    c.nombre_categoria,
    p.stock,
    p.precio
FROM PRODUCTO p
INNER JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
WHERE p.stock < 20 AND p.activo = TRUE
ORDER BY p.stock ASC;`;
            resultado = `<table>
                <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th></tr></thead>
                <tbody>
                    <tr><td>Aspiradora Roomba</td><td>Hogar</td><td>12</td><td>$399.99</td></tr>
                    <tr><td>Laptop HP</td><td>Electrónica</td><td>15</td><td>$899.99</td></tr>
                    <tr><td>Cafetera Nespresso</td><td>Hogar</td><td>18</td><td>$199.99</td></tr>
                </tbody>
            </table>`;
            break;

        case 'pedidos-pendientes':
            sql = `SELECT 
    ped.id_pedido,
    CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
    cli.telefono,
    ped.total,
    est.nombre_estado
FROM PEDIDO ped
INNER JOIN CLIENTE cli ON ped.id_cliente = cli.id_cliente
INNER JOIN ESTADO_PEDIDO est ON ped.id_estado = est.id_estado
WHERE est.nombre_estado IN ('Pendiente', 'Procesando')
ORDER BY ped.fecha_pedido ASC;`;
            resultado = `<table>
                <thead><tr><th>ID</th><th>Cliente</th><th>Teléfono</th><th>Total</th><th>Estado</th></tr></thead>
                <tbody>
                    <tr><td>4</td><td>Ana Martínez</td><td>0993456789</td><td>$149.99</td><td>Pendiente</td></tr>
                    <tr><td>3</td><td>Carlos Rodríguez</td><td>0998765432</td><td>$89.99</td><td>Procesando</td></tr>
                </tbody>
            </table>`;
            break;
    }

    document.getElementById('codigoConsulta').textContent = sql;
    document.getElementById('tablaResultado').innerHTML = resultado;
    document.getElementById('resultadoConsulta').style.display = 'block';
}

// =====================================================
// EJECUTAR SQL PERSONALIZADO
// =====================================================

function ejecutarSQLPersonalizado() {
    const sql = document.getElementById('sqlPersonalizado').value;
    if (sql.trim() === '') {
        alert('Por favor, escriba una consulta SQL');
        return;
    }
    alert('En una implementación real, esta consulta se ejecutaría en la base de datos:\n\n' + sql);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar formularios
    initClienteForm();
    initProductoForm();
    initPedidoForm();
    
    console.log('Sistema de Gestión de Tienda en Línea - Cargado correctamente');
});
