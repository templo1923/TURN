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
        $idDiasHorarios = isset($_GET['idDiasHorarios']) ? $_GET['idDiasHorarios'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
        $dias = isset($data['dias']) ? $data['dias'] : null;
        $estado = isset($data['estado']) ? $data['estado'] : 'activo';

        if (!$idDiasHorarios || !$dias ) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de días y horarios, días para actualizar."]);
            exit;
        }

        // Actualizar los días y horarios en la base de datos
        $sqlUpdate = "UPDATE dias_horarios SET dias = :dias, estado = :estado WHERE idDiasHorarios = :idDiasHorarios";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':dias', $dias);
        $sentenciaUpdate->bindParam(':estado', $estado);
        $sentenciaUpdate->bindParam(':idDiasHorarios', $idDiasHorarios, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Días y horarios actualizados correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar los días y horarios: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
