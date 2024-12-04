<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];
$rutaweb = $_ENV['RUTA_WEB'];
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $descripcion = $_POST['descripcion'];
        $titulo = $_POST['titulo'];
        $precio = $_POST['precio'];
        $idCategoria = $_POST['idCategoria'];
        $idSubCategoria = $_POST['idSubCategoria'];
        $estado = $_POST['estado'];
        $telefono = $_POST['telefono'];
        $email = $_POST['email'];
        $nombre = $_POST['nombre'];
        $tipo = $_POST['tipo'];
        $idUsuario = $_POST['idUsuario'];
        $direccion = $_POST['direccion']; // Nuevo campo dirección

        // Validación de caracteres no permitidos en el título
        if (strpos($titulo, '/') !== false || strpos($titulo, '\\') !== false) {
            echo json_encode(["error" => "El título no debe contener caracteres como / o \\"]);
            exit;
        }

        // Validación de campos obligatorios
        if (!empty($titulo) && !empty($precio) && !empty($idCategoria) && !empty($estado) && !empty($telefono) && !empty($email) && !empty($nombre) && !empty($tipo) && !empty($idUsuario) && !empty($direccion)) {
            $imagenPresente = isset($_FILES['imagen1']);

            if ($imagenPresente) {
                $carpetaImagenes = './imagenes_servicios';
                if (!file_exists($carpetaImagenes)) {
                    mkdir($carpetaImagenes, 0777, true);
                }

                $rutaImagenCompleta = '';
                if ($_FILES['imagen1']['error'] === UPLOAD_ERR_OK) {
                    $nombreImagen = $_FILES['imagen1']['name'];
                    $rutaImagen = $carpetaImagenes . '/' . $nombreImagen;
                    move_uploaded_file($_FILES['imagen1']['tmp_name'], $rutaImagen);
                    $rutaImagenCompleta = $rutaweb . $rutaImagen;
                }

                if ($rutaImagenCompleta === '') {
                    echo json_encode(["error" => "Debe seleccionar una imagen"]);
                    exit;
                }

                $sqlInsert = "INSERT INTO `servicios` (titulo, descripcion, precio, idCategoria, idSubCategoria, estado, imagen1, telefono, email, nombre, tipo, idUsuario, direccion) 
                              VALUES (:titulo, :descripcion, :precio, :idCategoria, :idSubCategoria, :estado, :imagen1, :telefono, :email, :nombre, :tipo, :idUsuario, :direccion)";
                $stmt = $conexion->prepare($sqlInsert);
                $stmt->bindParam(':titulo', $titulo);
                $stmt->bindParam(':descripcion', $descripcion);
                $stmt->bindParam(':precio', $precio);
                $stmt->bindParam(':idCategoria', $idCategoria);
                $stmt->bindParam(':idSubCategoria', $idSubCategoria);
                $stmt->bindParam(':estado', $estado);
                $stmt->bindParam(':imagen1', $rutaImagenCompleta);
                $stmt->bindParam(':telefono', $telefono);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':nombre', $nombre);
                $stmt->bindParam(':tipo', $tipo);
                $stmt->bindParam(':idUsuario', $idUsuario);
                $stmt->bindParam(':direccion', $direccion); // Bind del nuevo campo dirección
                $stmt->execute();

                $lastId = $conexion->lastInsertId();

                $sqlSelect = "SELECT createdAt FROM `servicios` WHERE idServicio = :lastId";
                $stmtSelect = $conexion->prepare($sqlSelect);
                $stmtSelect->bindParam(':lastId', $lastId);
                $stmtSelect->execute();
                $createdAt = $stmtSelect->fetchColumn();

                echo json_encode([
                    "mensaje" => "Servicio creado exitosamente",
                    "imagen1" => $rutaImagenCompleta,
                    "createdAt" => $createdAt
                ]);
            } else {
                echo json_encode(["error" => "Debe seleccionar una imagen"]);
            }
        } else {
            echo json_encode(["error" => "Por favor, complete todos los campos correctamente"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
