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
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idServicio = isset($_REQUEST['idServicio']) ? $_REQUEST['idServicio'] : null;
        $data = json_decode(file_get_contents("php://input"), true);

        $nuevaDescripcion = isset($data['nuevaDescripcion']) ? $data['nuevaDescripcion'] : null;
        $nuevoTitulo = isset($data['nuevoTitulo']) ? $data['nuevoTitulo'] : null;
        $nuevaCategoria = isset($data['nuevaCategoria']) ? $data['nuevaCategoria'] : null;
        $nuevaSubCategoria = isset($data['nuevaSubCategoria']) ? $data['nuevaSubCategoria'] : null;
        $nuevoPrecio = isset($data['nuevoPrecio']) ? $data['nuevoPrecio'] : null;
        $nuevoEstado = isset($data['nuevoEstado']) ? $data['nuevoEstado'] : null;
        $nuevoTelefono = isset($data['nuevoTelefono']) ? $data['nuevoTelefono'] : null;
        $nuevoEmail = isset($data['nuevoEmail']) ? $data['nuevoEmail'] : null;
        $nuevoNombre = isset($data['nuevoNombre']) ? $data['nuevoNombre'] : null;

        // Validar que el título no contenga '/' o '\'
        if (strpos($nuevoTitulo, '/') !== false || strpos($nuevoTitulo, '\\') !== false) {
            echo json_encode(["error" => "El título no debe contener '/' o '\\'."]);
            exit;
        }

        if (empty($nuevaCategoria)) {
            $sqlSelect = "SELECT idCategoria FROM servicios WHERE idServicio = :idServicio";
            $stmt = $conexion->prepare($sqlSelect);
            $stmt->bindParam(':idServicio', $idServicio, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $nuevaCategoria = $row['idCategoria'];
        }

        $sqlUpdate = "UPDATE servicios SET descripcion = :descripcion, titulo = :titulo, idCategoria = :idCategoria, idSubCategoria = :idSubCategoria, precio = :precio, estado = :estado, telefono = :telefono, email = :email, nombre = :nombre
        WHERE idServicio = :idServicio";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':descripcion', $nuevaDescripcion);
        $sentenciaUpdate->bindParam(':titulo', $nuevoTitulo);
        $sentenciaUpdate->bindParam(':idCategoria', $nuevaCategoria); 
        $sentenciaUpdate->bindParam(':idSubCategoria', $nuevaSubCategoria); 
        $sentenciaUpdate->bindParam(':precio', $nuevoPrecio);
        $sentenciaUpdate->bindParam(':estado', $nuevoEstado); 
        $sentenciaUpdate->bindParam(':telefono', $nuevoTelefono); 
        $sentenciaUpdate->bindParam(':email', $nuevoEmail);
        $sentenciaUpdate->bindParam(':nombre', $nuevoNombre);
        $sentenciaUpdate->bindParam(':idServicio', $idServicio, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Servicio actualizado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar el Servicio: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
