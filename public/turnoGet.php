<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
    // Conectar a la base de datos
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consultar todos los registros de la tabla turnos
        $sqlSelect = "SELECT * FROM turnos";  // Seleccionar todos los campos de la tabla 'turnos'
        $stmt = $conexion->query($sqlSelect);
        
        // Ejecutar la consulta
        $stmt->execute();
        $turnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Responder con los turnos en formato JSON
        echo json_encode(["turnos" => $turnos]);
    } else {
        // Método no permitido
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    // En caso de error en la conexión
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
