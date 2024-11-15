<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Obtener los datos de la solicitud
        $dias = json_decode($_POST['dias'], true);
        $estado = $_POST['estado'];
        $idServicio = $_POST['idServicio'];
        $nombre = $_POST['nombre'];
        $email = $_POST['email'];
        $telefono = $_POST['telefono'];
        $dni = $_POST['dni']; // Nuevo campo DNI
        $servicio = $_POST['servicio']; // Nuevo campo Servicio

        // Validar que los campos requeridos no estén vacíos
        if (!empty($dias) && !empty($idServicio) && !empty($nombre) && !empty($email) && !empty($telefono) && !empty($dni) && !empty($servicio)) {
            // Preparar la inserción para la tabla 'turnos'
            $sqlInsert = "INSERT INTO `turnos` (dias, estado, idServicio, nombre, email, telefono, dni, servicio) 
                          VALUES (:dias, :estado, :idServicio, :nombre, :email, :telefono, :dni, :servicio)";
            $stmt = $conexion->prepare($sqlInsert);

            // Convertir el array de días a JSON
            $diasJson = json_encode($dias);

            // Asignar los parámetros a la consulta
            $stmt->bindParam(':dias', $diasJson);
            $stmt->bindParam(':estado', $estado);
            $stmt->bindParam(':idServicio', $idServicio);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':telefono', $telefono);
            $stmt->bindParam(':dni', $dni); // Asociar el parámetro DNI
            $stmt->bindParam(':servicio', $servicio); // Asociar el parámetro Servicio

            // Ejecutar la consulta e informar del resultado
            if ($stmt->execute()) {
                $lastId = $conexion->lastInsertId();
                echo json_encode([
                    "mensaje" => "Turno creado exitosamente",
                    "idTurno" => $lastId
                ]);
            } else {
                echo json_encode(["error" => "Error al crear el turno"]);
            }
        } else {
            echo json_encode(["error" => "Por favor, proporcione todos los datos requeridos (dias, idServicio, nombre, email, telefono, dni, servicio)"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
