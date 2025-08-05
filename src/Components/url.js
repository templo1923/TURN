// Detecta si la URL tiene 'www.' o no y devuelve la base correcta
const getBaseURL = () => {
    const currentHost = window.location.hostname; // Obtiene el host actual
    if (currentHost.startsWith('www.')) {
        return 'http://75.102.22.152/~catalogo/';
    } else {
        return 'http://75.102.22.152/~catalogo/';
    }
};

const baseURL = getBaseURL(); // Obtiene la URL base correcta

export default baseURL;
