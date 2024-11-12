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
        // Obtener el id de días y horarios desde la URL
        $idDiaHorario = isset($_GET['idDiaHorario']) ? $_GET['idDiaHorario'] : null;

        if (!$idDiaHorario) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de día y horario para eliminarlo."]);
            exit;
        }

        // Iniciar transacción para eliminar de manera segura
        $conexion->beginTransaction();

        try {
            // Eliminar el registro de la tabla dias_horarios
            $sqlDelete = "DELETE FROM dias_horarios WHERE idDiaHorario = :idDiaHorario";
            $sentenciaDelete = $conexion->prepare($sqlDelete);
            $sentenciaDelete->bindParam(':idDiaHorario', $idDiaHorario, PDO::PARAM_INT);
            $sentenciaDelete->execute();

            // Confirmar los cambios en la base de datos
            $conexion->commit();
            echo json_encode(["mensaje" => "Día y horario eliminados correctamente"]);

        } catch (Exception $e) {
            // En caso de error, revertir la transacción
            $conexion->rollBack();
            echo json_encode(["error" => "Error al eliminar el día y horario: " . $e->getMessage()]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
