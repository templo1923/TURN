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
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $idServicio = isset($_GET['idServicio']) ? $_GET['idServicio'] : null;

        if (!$idServicio) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de servicio para eliminarlo."]);
            exit;
        }

        // Obtener solo imagen1 de la base de datos
        $sqlSelectImagen = "SELECT imagen1 FROM servicios WHERE idServicio = :idServicio";
        $sentenciaSelectImagen = $conexion->prepare($sqlSelectImagen);
        $sentenciaSelectImagen->bindParam(':idServicio', $idServicio, PDO::PARAM_INT);
        $sentenciaSelectImagen->execute();
        $imagen = $sentenciaSelectImagen->fetch(PDO::FETCH_ASSOC);

        // Eliminar el servicio de la base de datos
        $sqlDelete = "DELETE FROM servicios WHERE idServicio = :idServicio";
        $sentenciaDelete = $conexion->prepare($sqlDelete);
        $sentenciaDelete->bindParam(':idServicio', $idServicio, PDO::PARAM_INT);

        if ($sentenciaDelete->execute()) {
            // Eliminar solo imagen1 de la carpeta de imágenes (si existe)
            if (isset($imagen['imagen1']) && $imagen['imagen1']) {
                $carpetaImagenes = './imagenes_servicios/';
                $rutaImagen = $carpetaImagenes . basename($imagen['imagen1']);
                if (file_exists($rutaImagen)) {
                    unlink($rutaImagen); // Eliminar imagen1
                }
            }

            echo json_encode(["mensaje" => "Servicio y la imagen1 asociada eliminados correctamente"]);
        } else {
            echo json_encode(["error" => "Error al eliminar el servicio"]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
