<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

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

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Obtener el idTurno de la URL (GET)
        $idTurno = isset($_GET['idTurno']) ? $_GET['idTurno'] : null;

        // Obtener los datos del cuerpo de la solicitud (PUT)
        $data = json_decode(file_get_contents("php://input"), true);

        // Verificar que el estado esté presente en los datos enviados
        if (!$idTurno || !isset($data['estado'])) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de turno y el estado."]);
            exit;
        }

        $estado = $data['estado'];

        // Actualizar solo el campo 'estado' en la base de datos
        $sqlUpdate = "UPDATE turnos SET estado = :estado WHERE idTurno = :idTurno";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':estado', $estado);
        $sentenciaUpdate->bindParam(':idTurno', $idTurno, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Turno actualizado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar el turno: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
