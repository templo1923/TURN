<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Obtener el id del turno desde la URL
        $idTurno = isset($_GET['idTurno']) ? $_GET['idTurno'] : null;

        if (!$idTurno) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de turno para eliminarlo."]);
            exit;
        }

        // Iniciar transacción para eliminar de manera segura
        $conexion->beginTransaction();

        try {
            // Eliminar el registro de la tabla turnos
            $sqlDelete = "DELETE FROM turnos WHERE idTurno = :idTurno";
            $sentenciaDelete = $conexion->prepare($sqlDelete);
            $sentenciaDelete->bindParam(':idTurno', $idTurno, PDO::PARAM_INT);
            $sentenciaDelete->execute();

            // Confirmar los cambios en la base de datos
            $conexion->commit();
            echo json_encode(["mensaje" => "Turno eliminado correctamente"]);

        } catch (Exception $e) {
            // En caso de error, revertir la transacción
            $conexion->rollBack();
            echo json_encode(["error" => "Error al eliminar el turno: " . $e->getMessage()]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
