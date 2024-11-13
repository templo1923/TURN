import React, { useState, useEffect } from 'react';
import './NewServicio.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import imageIcon from '../../../images/imageIcon.png';
import { fetchUsuario, getUsuario } from '../../user';
import Swal from 'sweetalert2';
import planes from '../../planes';
export default function NewServicio() {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview, setImagenPreview] = useState([null, null, null, null]); // Arreglo para imágenes
    const [isImageSelected, setIsImageSelected] = useState([false, false, false, false]); // Arreglo para selección de imágenes
    const [descripcion, setDescripcion] = useState('');
    const [titulo, setTitulo] = useState('');
    const [estado, setEstado] = useState('');
    const [precio, setPrecio] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [categorias, setCategoras] = useState([]);
    const [subcategorias, setSubCategorias] = useState([]);
    const [categoriasConSubcategorias, setCategoriasConSubcategorias] = useState([]);
    const [idCategoria, setIdCategoria] = useState('');
    const [idSubCategoria, setIdSubCategoria] = useState('');
    const [telefono, setTelefono] = useState('');
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        cargarCategoriasYSubcategorias();
    }, []);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };
    useEffect(() => {
        cargarCategoria();
        cargarSubCategoria();
    }, []);
    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
                console.log(data.categorias);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    const cargarSubCategoria = () => {
        fetch(`${baseURL}/subCategoriaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setSubCategorias(data.subcategorias || []);
                console.log(data.subcategorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    const handleImagenChange = (event, index) => {
        const file = event.target.files[0];

        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagenPreview(prev => {
                const newPreviews = [...prev];
                newPreviews[index] = previewURL;
                return newPreviews;
            });
            setIsImageSelected(prev => {
                const newSelection = [...prev];
                newSelection[index] = true;
                return newSelection;
            });
        }
    };

    const eliminarImagen = (index) => {
        setImagenPreview(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = null;
            return newPreviews;
        });
        setIsImageSelected(prev => {
            const newSelection = [...prev];
            newSelection[index] = false;
            return newSelection;
        });
    };
    const cargarCategoriasYSubcategorias = async () => {
        try {
            const [categoriasRes, subcategoriasRes] = await Promise.all([
                fetch(`${baseURL}/categoriasGet.php`).then(res => res.json()),
                fetch(`${baseURL}/subCategoriaGet.php`).then(res => res.json()),
            ]);

            const categorias = categoriasRes.categorias || [];
            const subcategorias = subcategoriasRes.subcategorias || [];

            const categoriasConSub = categorias.map(categoria => {
                return {
                    ...categoria,
                    subcategorias: subcategorias.filter(sub => sub.idCategoria === categoria.idCategoria),
                };
            });

            setCategoriasConSubcategorias(categoriasConSub);
        } catch (error) {
            console.error('Error al cargar categorías y subcategorías:', error);
        }
    };

    const handleCategoriaSeleccion = (e) => {
        const selectedValue = e.target.value;

        // Separar idCategoria de idSubCategoria si está presente
        const [categoriaId, subCategoriaId] = selectedValue.split('-');

        setIdCategoria(categoriaId);

        if (subCategoriaId) {
            setIdSubCategoria(subCategoriaId);
        } else {
            setIdSubCategoria(''); // No subcategoría seleccionada
        }
    };




    const crear = async () => {
        const form = document.getElementById("crearForm");
        const formData = new FormData(form);

        // Validar que los campos obligatorios estén completos
        if (!formData.get('titulo') || !idCategoria || !formData.get('precio')) {
            toast.error('Por favor, complete todos los campos obligatorios.');
            return;
        }

        // Añadir idCategoria al FormData
        formData.append('idCategoria', idCategoria);
        // Verificar si se ha seleccionado una subcategoría, de lo contrario, añadir 0
        if (idSubCategoria) {
            formData.append('idSubCategoria', idSubCategoria);
        } else {
            formData.append('idSubCategoria', '0');
        }
        formData.append('nombre', nombre);
        formData.append('email', email);


        try {
            const response = await fetch(`${baseURL}/serviciosPost.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.mensaje) {
                toast.success(data.mensaje);
                window.location.reload();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error al crear:', error);
            toast.error('Error de conexión. Inténtelo de nuevo.');
        }
    };

    const handleEstado = (e) => {
        setEstado(e.target.value);
    };




    //Trae usuario logueado-----------------------------
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario();
            setLoading(false);
        };

        fetchData();
    }, []);
    const usuarioLegued = getUsuario();
    const alertPermiso = () => {
        Swal.fire(
            '¡Error!',
            '¡No tienes permisos!',
            'error'
        );
    }


    //Calcular limite de Plan-----------------------------
    const plan = planes[0]?.plan
    const limitePlan = planes[0]?.limiteProducto
    const mensagePlan = `¡Alcanzaste el límite del plan ${plan}! <br/>Tu límite son ${limitePlan} productos`
    const [productos, setProductos] = useState([]);
    const alertPlan = () => {
        cargarProductos();
        Swal.fire(
            '¡Error!',
            mensagePlan,
            'error'
        );
    };
    useEffect(() => {
        cargarProductos();

    }, []);
    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos || []);
                console.log(data.productos)
            })
            .catch(error => console.error('Error al cargar productos:', error));
    };


    return (
        <div className='NewContain'>
            <ToastContainer />
            {loading ? (
                <></>
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <button onClick={toggleModal} className='btnSave'>
                            <span>+</span> Agregar
                        </button>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <>
                            {
                                productos?.length < limitePlan ? (
                                    <button onClick={toggleModal} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>

                                ) : (
                                    <button onClick={alertPlan} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>
                                )
                            }
                        </>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <>
                    {
                        productos?.length < limitePlan ? (
                            <button onClick={toggleModal} className='btnSave'>
                                <span>+</span> Agregar
                            </button>

                        ) : (
                            <button onClick={alertPlan} className='btnSave'>
                                <span>+</span> Agregar
                            </button>
                        )
                    }
                </>
            )}
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Servicio</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form id="crearForm">

                            <div className='flexGrap'>
                                <fieldset id='titulo'>
                                    <legend>Título (*)</legend>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        required
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Categoría (*)</legend>
                                    <select
                                        id="categoriaSeleccionada"
                                        name="categoriaSeleccionada"
                                        onChange={handleCategoriaSeleccion}
                                        required
                                    >
                                        <option value="">Categoría / subcategoría</option>
                                        {categoriasConSubcategorias.map(categoria => (
                                            <optgroup key={categoria.idCategoria}>
                                                <option value={`${categoria.idCategoria}`} id='option'>{categoria.categoria}</option>
                                                {categoria.subcategorias.map(subcategoria => (
                                                    <option key={subcategoria.idSubCategoria} value={`${categoria.idCategoria}-${subcategoria.idSubCategoria}`}>
                                                        {categoria.categoria} {`>`} {subcategoria.subcategoria}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </fieldset>




                                <fieldset>
                                    <legend>Precio (*)</legend>
                                    <input
                                        type="number"
                                        id="precio"
                                        name="precio"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                    />
                                </fieldset>


                                <fieldset>
                                    <legend>Estado (*)</legend>
                                    <select
                                        id="estado"
                                        name="estado"
                                        value={estado}
                                        onChange={handleEstado}
                                    >
                                        <option value="">Selecciona opcion</option>
                                        <option value="Disponible">Disponible</option>
                                        <option value="No-Disponible">No-Disponible</option>
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Nombre (*)</legend>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        required
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                </fieldset>



                                <fieldset>
                                    <legend>Telefono (*)</legend>
                                    <input
                                        type="text"
                                        id="telefono"
                                        name="telefono"
                                        required
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Email (*)</legend>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset id='descripcion'>
                                    <legend>Descripción  </legend>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        required
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Descripción"
                                    />
                                </fieldset>


                                <div className='image-container'>
                                    {[...Array(1)].map((_, index) => (
                                        <div key={index} className='flexGrap'>
                                            <input
                                                type="file"
                                                id={`imagen${index + 1}`}
                                                name={`imagen${index + 1}`}
                                                accept="image/*"
                                                onChange={(e) => handleImagenChange(e, index)}
                                                style={{ display: 'none' }} // Ocultar input file
                                                required
                                            />
                                            <label htmlFor={`imagen${index + 1}`} className={`image-banner-label ${isImageSelected[index] ? 'selectedImage' : ''}`}>
                                                {isImageSelected[index] ? (
                                                    <img src={imagenPreview[index]} alt={`Vista previa ${index + 1}`} className='image-banner-prev' />
                                                ) : (
                                                    <img src={imageIcon} alt="Seleccionar imagen" className='image-banner' />
                                                )}
                                            </label>
                                            {isImageSelected[index] && (
                                                <button type="button" onClick={() => eliminarImagen(index)} className='eliminar-imagen'>
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                            </div>
                            {mensaje ? (
                                <button type="button" className='btnLoading' disabled>
                                    {mensaje}
                                </button>
                            ) : (
                                <button type="button" onClick={crear} className='btnPost'>
                                    Agregar
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
