<?php
// Cargar variables de entorno desde el archivo .env
require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Función para crear una tabla si no existe
    function crearTablaSiNoExiste($conexion, $nombreTabla, $consultaSQL) {
        $sql = "SHOW TABLES LIKE '$nombreTabla'";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() == 0) {
            // La tabla no existe, se crea
            $stmtCreate = $conexion->prepare($consultaSQL);
            $stmtCreate->execute();
            echo "Tabla $nombreTabla creada correctamente.<br>";
        } else {
            echo "La tabla $nombreTabla ya existe.<br>";
        }
    }

    // Crear tabla 'categorias' si no existe
    $consultaCategorias = "CREATE TABLE IF NOT EXISTS `categorias` (
        idCategoria INT(11) AUTO_INCREMENT PRIMARY KEY,
        categoria VARCHAR(100) NOT NULL,
        orden INT(100)
    )";
    crearTablaSiNoExiste($conexion, 'categorias', $consultaCategorias);

    // Crear tabla 'subcategorias' si no existe
    $consultaSubCategorias = "CREATE TABLE IF NOT EXISTS `subcategorias` (
        idSubCategoria INT(11) AUTO_INCREMENT PRIMARY KEY,
        idCategoria INT(100) NOT NULL,
        subcategoria VARCHAR(100) NOT NULL
    )";
    crearTablaSiNoExiste($conexion, 'subcategorias', $consultaSubCategorias);

    // Crear tabla 'banner' si no existe
    $consultaBanner = "CREATE TABLE IF NOT EXISTS `banner` (
        idBanner INT(11) AUTO_INCREMENT PRIMARY KEY,
        imagen VARCHAR(900) NOT NULL,
        seleccion VARCHAR(10) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'banner', $consultaBanner);

    // Crear tabla 'servicios'
    $consultaServicios = "CREATE TABLE IF NOT EXISTS `servicios` (
        idServicio INT(11) AUTO_INCREMENT PRIMARY KEY,
        descripcion TEXT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        precio INT(100),
        telefono VARCHAR(20) NOT NULL,
        idCategoria INT(100) NOT NULL,
        idSubCategoria INT(100),
        idUsuario INT(100) NOT NULL,
        imagen1 VARCHAR(900),
        estado VARCHAR(30) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        tipo VARCHAR(10) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'servicios', $consultaServicios);

    // Crear tabla 'dias_horarios' si no existe
    $consultaDiasHorarios = "CREATE TABLE IF NOT EXISTS `dias_horarios` (
    idDiasHorarios INT(11) AUTO_INCREMENT PRIMARY KEY,
    dias JSON NOT NULL,
    estado VARCHAR(30) NOT NULL,
    idServicio INT(11) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'dias_horarios', $consultaDiasHorarios);

    // Crear tabla 'turnos'
    $consultaTurnos = "CREATE TABLE IF NOT EXISTS `turnos` (
        idTurno INT(11) AUTO_INCREMENT PRIMARY KEY,
        idServicio INT(100) NOT NULL,
        servicio VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        dni VARCHAR(20) NOT NULL,
        telefono VARCHAR(255) NOT NULL,
        estado VARCHAR(30) NOT NULL,
        dias JSON NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'turnos', $consultaTurnos);

    // Crear tabla 'tienda' si no existe
    $consultaTiendas = "CREATE TABLE IF NOT EXISTS `tienda` (
        idTienda INT(11) AUTO_INCREMENT PRIMARY KEY,
        imagen1 VARCHAR(900),
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        eslogan VARCHAR(100),
        direccion VARCHAR(255) NOT NULL,
        instagram VARCHAR(100),
        facebook VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'tienda', $consultaTiendas);


    // Crear tabla 'usuarios' si no existe
    $consultaUsuarios = "CREATE TABLE IF NOT EXISTS `usuarios` (
        idUsuario INT(11) AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        rol  VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'usuarios', $consultaUsuarios);

    $contrasenaAdmin = password_hash('admin1234', PASSWORD_DEFAULT);

    // Insertar nuevo usuario admin
    $sqlInsertAdmin = "INSERT INTO `usuarios` (nombre, email, contrasena, rol, createdAt) 
                        VALUES ('admin', 'admin@gmail.com', :contrasenaAdmin, 'admin', NOW())";
    $stmtAdmin = $conexion->prepare($sqlInsertAdmin);
    $stmtAdmin->bindParam(':contrasenaAdmin', $contrasenaAdmin);
    $stmtAdmin->execute();

    echo "Usuario admin creado correctamente.";

    echo "Proceso de creación de tablas finalizado.";
} catch (PDOException $error) {
    echo "Error de conexión: " . $error->getMessage();
}
?>
