// =====================================================
// JAVASCRIPT - SISTEMA DE GESTIÓN TIENDA EN LÍNEA
// Con conexión a APIs Backend
// =====================================================

// Configuración de la API
const API_URL = 'http://localhost/tienda_online/api';

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
    
    // Activar el botón correspondiente
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Cargar datos al abrir ciertas tabs
    if (tabName === 'clientes') {
        cargarClientes();
    } else if (tabName === 'productos') {
        cargarProductos();
    } else if (tabName === 'pedidos') {
        cargarPedidos();
    }
}

// Inicializar event listeners para tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

// Inicializar botones de "ir a"
function initGotoButtons() {
    const gotoButtons = document.querySelectorAll('[data-goto]');
    gotoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-goto');
            showTab(tabName);
        });
    });
}

// =====================================================
// MANEJO DE FORMULARIOS
// =====================================================

// Formulario de Cliente
function initClienteForm() {
    const form = document.getElementById('formCliente');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                nombre: document.getElementById('nombreCliente').value,
                apellido: document.getElementById('apellidoCliente').value,
                email: document.getElementById('emailCliente').value,
                telefono: document.getElementById('telefonoCliente').value,
                direccion: document.getElementById('direccionCliente').value,
                ciudad: document.getElementById('ciudadCliente').value,
                pais: document.getElementById('paisCliente').value,
                codigo_postal: document.getElementById('codigoPostalCliente').value
            };
            
            try {
                const response = await fetch(`${API_URL}/clientes.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Cliente creado exitosamente');
                    this.reset();
                    cargarClientes();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor. Asegúrate de que XAMPP esté ejecutándose.');
            }
        });
    }
}

// Formulario de Producto
function initProductoForm() {
    const form = document.getElementById('formProducto');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                nombre_producto: document.getElementById('nombreProducto').value,
                id_categoria: parseInt(document.getElementById('categoriaProducto').value),
                descripcion: document.getElementById('descripcionProducto').value,
                precio: parseFloat(document.getElementById('precioProducto').value),
                stock: parseInt(document.getElementById('stockProducto').value),
                imagen_url: document.getElementById('imagenProducto').value
            };
            
            try {
                const response = await fetch(`${API_URL}/productos.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Producto creado exitosamente');
                    this.reset();
                    cargarProductos();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }
}

// Formulario de Pedido
function initPedidoForm() {
    const form = document.getElementById('formPedido');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                id_cliente: parseInt(document.getElementById('clientePedido').value),
                id_metodo_pago: parseInt(document.getElementById('metodoPago').value),
                notas: document.getElementById('notasPedido').value,
                productos: [
                    {
                        id_producto: 1,
                        cantidad: 1
                    }
                ]
            };
            
            try {
                const response = await fetch(`${API_URL}/pedidos.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Pedido creado exitosamente');
                    this.reset();
                    cargarPedidos();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }
}

// =====================================================
// CARGAR DATOS DESDE LA API
// =====================================================

async function cargarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes.php`);
        const result = await response.json();
        
        if (result.success && result.data) {
            mostrarClientes(result.data);
        }
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

function mostrarClientes(clientes) {
    const tbody = document.querySelector('#clientes .table-container tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.id_cliente}</td>
            <td>${cliente.nombre} ${cliente.apellido}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefono || 'N/A'}</td>
            <td>${cliente.ciudad || 'N/A'}</td>
            <td>
                <button class="btn btn-warning" style="padding: 5px 15px; margin: 0 5px 0 0;" onclick="editarCliente(${cliente.id_cliente})">Editar</button>
                <button class="btn btn-danger" style="padding: 5px 15px; margin: 0;" onclick="eliminarCliente(${cliente.id_cliente})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos.php`);
        const result = await response.json();
        
        if (result.success && result.data) {
            mostrarProductos(result.data);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function mostrarProductos(productos) {
    const tbody = document.querySelector('#productos .table-container tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.id_producto}</td>
            <td>${producto.nombre_producto}</td>
            <td>${producto.nombre_categoria}</td>
            <td>$${parseFloat(producto.precio).toFixed(2)}</td>
            <td>${producto.stock}</td>
            <td>
                <button class="btn btn-warning" style="padding: 5px 15px; margin: 0 5px 0 0;" onclick="editarProducto(${producto.id_producto})">Editar</button>
                <button class="btn btn-danger" style="padding: 5px 15px; margin: 0;" onclick="eliminarProducto(${producto.id_producto})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cargarPedidos() {
    try {
        const response = await fetch(`${API_URL}/pedidos.php`);
        const result = await response.json();
        
        if (result.success && result.data) {
            mostrarPedidos(result.data);
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
    }
}

function mostrarPedidos(pedidos) {
    const tbody = document.querySelector('#pedidos .table-container tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha_pedido).toLocaleDateString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pedido.id_pedido}</td>
            <td>${pedido.cliente}</td>
            <td>${fecha}</td>
            <td>$${parseFloat(pedido.total).toFixed(2)}</td>
            <td><span class="status-badge status-${pedido.nombre_estado.toLowerCase()}">${pedido.nombre_estado}</span></td>
            <td>${pedido.nombre_metodo}</td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 15px; margin: 0;" onclick="verPedido(${pedido.id_pedido})">Ver</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =====================================================
// FUNCIONES DE ELIMINACIÓN
// =====================================================

async function eliminarCliente(id) {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    
    try {
        const response = await fetch(`${API_URL}/clientes.php?id=${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Cliente eliminado exitosamente');
            cargarClientes();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar cliente');
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/productos.php?id=${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Producto eliminado exitosamente');
            cargarProductos();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar producto');
    }
}

// Funciones placeholder para editar
function editarCliente(id) {
    alert('Función de edición en desarrollo. ID: ' + id);
}

function editarProducto(id) {
    alert('Función de edición en desarrollo. ID: ' + id);
}

function verPedido(id) {
    alert('Ver detalles del pedido ' + id + ' - En desarrollo');
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

// Inicializar botones de acción
function initActionButtons() {
    // Botón Ver SQL Cliente
    const btnSQLCliente = document.querySelector('[data-action="ver-sql-cliente"]');
    if (btnSQLCliente) {
        btnSQLCliente.addEventListener('click', generarSQLCliente);
    }
    
    // Botón Ver SQL Producto
    const btnSQLProducto = document.querySelector('[data-action="ver-sql-producto"]');
    if (btnSQLProducto) {
        btnSQLProducto.addEventListener('click', generarSQLProducto);
    }
    
    // Botón Ver SQL Pedido
    const btnSQLPedido = document.querySelector('[data-action="ver-sql-pedido"]');
    if (btnSQLPedido) {
        btnSQLPedido.addEventListener('click', generarSQLPedido);
    }
    
    // Botón Ejecutar SQL
    const btnEjecutarSQL = document.querySelector('[data-action="ejecutar-sql"]');
    if (btnEjecutarSQL) {
        btnEjecutarSQL.addEventListener('click', ejecutarSQLPersonalizado);
    }
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

// Inicializar botones de consultas
function initConsultaButtons() {
    const consultaButtons = document.querySelectorAll('[data-consulta]');
    consultaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tipo = this.getAttribute('data-consulta');
            mostrarConsulta(tipo);
        });
    });
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
    // Inicializar navegación de tabs
    initTabs();
    
    // Inicializar botones de "ir a"
    initGotoButtons();
    
    // Inicializar formularios
    initClienteForm();
    initProductoForm();
    initPedidoForm();
    
    // Inicializar botones de acción
    initActionButtons();
    
    // Inicializar botones de consultas
    initConsultaButtons();
    
    // Cargar datos iniciales
    cargarClientes();
    
    console.log('Sistema de Gestión de Tienda en Línea - Cargado correctamente');
    console.log('API URL:', API_URL);
});
