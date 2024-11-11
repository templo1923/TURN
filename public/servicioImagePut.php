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
$rutaweb = $_ENV['RUTA_WEB'];
$mensaje = "";
$carpetaImagenes = './imagenes_servicios'; // Ruta de las imágenes de los servicios

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idServicio = isset($_REQUEST['idServicio']) ? $_REQUEST['idServicio'] : null;

        if (!$idServicio) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de servicio para actualizar la imagen."]);
            exit;
        }

        $nombreImagen1 = $_FILES['imagen1']['name'];
        $rutaImagen1Completa = '';
        if (!empty($nombreImagen1)) {
            $rutaImagen1 = $carpetaImagenes . '/' . $nombreImagen1;
            
            if (move_uploaded_file($_FILES['imagen1']['tmp_name'], $rutaImagen1)) {
                $rutaImagen1Completa = $rutaweb . $rutaImagen1;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen1"]);
                exit;
            }
        }

        // Obtener la imagen actual de imagen1 para no sobrescribir si no se sube una nueva
        $sqlSelect = "SELECT imagen1 FROM servicios WHERE idServicio = :idServicio"; // Cambia de productos a servicios
        $sentenciaSelect = $conexion->prepare($sqlSelect);
        $sentenciaSelect->bindParam(':idServicio', $idServicio, PDO::PARAM_INT);
        $sentenciaSelect->execute();
        $valoresActuales = $sentenciaSelect->fetch(PDO::FETCH_ASSOC);
    
        // Si no se ha subido una nueva imagen, se mantiene la actual
        $rutaImagen1Completa = $rutaImagen1Completa ?: $valoresActuales['imagen1'];

        // Actualizar solo la imagen1
        $sqlUpdate = "UPDATE servicios SET imagen1 = :imagen1 WHERE idServicio = :idServicio"; // Cambiar a servicios
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':imagen1', $rutaImagen1Completa);
        $sentenciaUpdate->bindParam(':idServicio', $idServicio, PDO::PARAM_INT);
    
        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Imagen1 actualizada correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar la imagen1: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
