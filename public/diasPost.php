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

        // Validar que los campos requeridos no estén vacíos
        if (!empty($dias) && !empty($idServicio)) {
            // Verificar si ya existe un registro con el mismo idServicio
            $sqlCheck = "SELECT COUNT(*) FROM `dias_horarios` WHERE idServicio = :idServicio";
            $stmtCheck = $conexion->prepare($sqlCheck);
            $stmtCheck->bindParam(':idServicio', $idServicio);
            $stmtCheck->execute();
            $count = $stmtCheck->fetchColumn();

            if ($count > 0) {
                // Si ya existe un registro con el mismo idServicio
                echo json_encode(["error" => "Ya existe datos para este servicio"]);
            } else {
                // Preparar la inserción para la tabla 'dias_horarios'
                $sqlInsert = "INSERT INTO `dias_horarios` (dias, estado, idServicio) VALUES (:dias, :estado, :idServicio)";
                $stmt = $conexion->prepare($sqlInsert);

                // Convertir el JSON del día y horarios a string
                $diasJson = json_encode($dias);

                $stmt->bindParam(':dias', $diasJson);
                $stmt->bindParam(':estado', $estado);
                $stmt->bindParam(':idServicio', $idServicio);

                // Ejecutar la consulta e informar del resultado
                if ($stmt->execute()) {
                    $lastId = $conexion->lastInsertId();
                    echo json_encode([
                        "mensaje" => "Días y horarios creados exitosamente",
                        "idDiasHorarios" => $lastId
                    ]);
                } else {
                    echo json_encode(["error" => "Error al crear días y horarios"]);
                }
            }
        } else {
            echo json_encode(["error" => "Por favor, proporcione todos los datos requeridos (dias, idServicio)"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
