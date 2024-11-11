import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faArrowUp, faArrowDown, faSync, faEye } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './ServiciosData.css'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewServicio from '../NewServicio/NewServicio';
import moneda from '../../moneda';
import { Link as Anchor } from "react-router-dom";
import imageIcon from '../../../images/imageIcon.png';
import { fetchUsuario, getUsuario } from '../../user';
export default function ServiciosData() {
    const [servicios, setServicios] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [servicio, setServicio] = useState({});
    const [modalImagenVisible, setModalImagenVisible] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState('');
    const [filtroId, setFiltroId] = useState('');
    const [filtroTitulo, setFiltroTitulo] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [ordenInvertido, setOrdenInvertido] = useState(false);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [selectedSection, setSelectedSection] = useState('texto');
    const [categorias, setCategoras] = useState([]);
    const [subcategorias, setSubCategorias] = useState([]);
    const [visibleCount, setVisibleCount] = useState(20);
    const [categoriasConSubcategorias, setCategoriasConSubcategorias] = useState([]);
    const [idCategoria, setIdCategoria] = useState('');
    const [idSubCategoria, setIdSubCategoria] = useState('');
    const handleShowMore = () => {
        setVisibleCount(prevCount => prevCount + 20);
    };

    useEffect(() => {
        cargarCategoriasYSubcategorias();
    }, []);
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
    const cerrarModalImagen = () => {
        setModalImagenVisible(false);
    };
    const abrirModalImagenSeleccionada = (imagen) => {
        setImagenSeleccionada(imagen);
        setModalImagenVisible(true);
    };


    useEffect(() => {
        cargarServicios();

    }, []);

    useEffect(() => {
        // Actualiza el valor del select cuando cambia el estado nuevoEstado
        setNuevoTitulo(servicio.titulo);
        setNuevaDescripcion(servicio.descripcion);
        setNuevoPrecio(servicio.precio);
        setNuevoEstado(servicio.estado)
        setIdCategoria(servicio.idCategoria)
        setIdSubCategoria(servicio.idSubCategoria)
    }, [servicio]);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
                console.log(data.servicios)
            })
            .catch(error => console.error('Error al cargar servicios:', error));
    };

    const eliminarProducto = (idServicio) => {
        // Reemplaza el window.confirm con SweetAlert2
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/servicioDelete.php?idServicio=${idServicio}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        window.location.reload();
                        cargarServicios();
                    })
                    .catch(error => {
                        console.error('Error al eliminar:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setServicio(item);
        setNuevoTitulo(item.titulo);
        setNuevaDescripcion(item.descripcion);
        setNuevoPrecio(item.precio);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const filtrados = servicios.filter(item => {
        const idMatch = item.idServicio.toString().includes(filtroId);
        const tituloMatch = !filtroTitulo || item.titulo.toLowerCase().includes(filtroTitulo.toLowerCase());
        const categoriaMatch = item.idCategoria.toString().includes(filtroCategoria);
        const estadoMatch = !filtroEstado || item.estado.includes(filtroEstado);
        return idMatch && tituloMatch && categoriaMatch && estadoMatch;
    });

    const descargarExcel = () => {
        const data = filtrados.map(item => ({
            Id: item.idServicio,
            Titulo: item.titulo,
            Descripcion: item.descripcion,
            Precio: item.precio,
            Fecha: item.createdAt,
            Estado: item.estado,
            Imagen1: item.imagen1,

        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Servicios');
        XLSX.writeFile(wb, 'Servicios.xlsx');
    };

    const descargarPDF = () => {
        const pdf = new jsPDF();
        pdf.text('Lista de Servicios', 10, 10);

        const columns = [
            { title: 'idServicio', dataKey: 'idServicio' },
            { title: 'Titulo', dataKey: 'titulo' },
            { title: 'Descripcion', dataKey: 'descripcion' },
            { title: 'Precio', dataKey: 'precio' },
            { title: 'Estado', dataKey: 'estado' },
            { title: 'Fecha', dataKey: 'createdAt' },
        ];

        const data = filtrados.map(item => ({
            idServicio: item.idServicio,
            Titulo: item.titulo,
            Descripcion: item.descripcion,
            Precio: item.precio,
            Estado: item.estado,
            Fecha: item.createdAt,

        }));

        pdf.autoTable({
            head: [columns.map(col => col.title)],
            body: data.map(item => Object.values(item)),
        });

        pdf.save('servicios.pdf');
    };

    const recargar = () => {
        cargarServicios();
    };
    const invertirOrden = () => {
        setServicios([...servicios].reverse());
        setOrdenInvertido(!ordenInvertido);
    };


    const handleUpdateText = async (idServicio) => {
        const payload = {

            nuevoTitulo: nuevoTitulo !== '' ? nuevoTitulo : servicio.titulo,
            nuevaDescripcion: nuevaDescripcion !== undefined ? nuevaDescripcion : servicio.descripcion,
            nuevoPrecio: nuevoPrecio !== '' ? nuevoPrecio : servicio.precio,
            nuevaCategoria: idCategoria !== '' ? idCategoria : servicio.idCategoria,
            nuevaSubCategoria: idSubCategoria !== 0 ? idSubCategoria : servicio.idSubCategoria,
            nuevoEstado: nuevoEstado !== '' ? nuevoEstado : servicio.estado,
        };

        fetch(`${baseURL}/servicioTextPut.php?idServicio=${idServicio}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {

                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                } else {

                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarServicios();
                    cerrarModal()
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };

    const handleFileChange = (event, setFile, setPreview) => {
        const file = event.target.files[0];

        if (file) {
            // Crear una URL de objeto para la imagen seleccionada
            const previewURL = URL.createObjectURL(file);
            setFile(file);
            setPreview(previewURL);
        }
    };
    const handleEditarImagenBanner = async (idServicio) => {
        const formData = new FormData();
        formData.append('idServicio', idServicio);
        formData.append('updateAction', 'update'); // Campo adicional para indicar que es una actualización

        if (nuevaImagen) {
            formData.append('imagen1', nuevaImagen);
        }


        fetch(`${baseURL}/servicioImagePut.php`, {
            method: 'POST',  // Cambiado a POST
            body: formData
        })
            .then(response => {
                // Manejar el caso cuando la respuesta no es un JSON válido o está vacía
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');

                }

                return response.json();
            })
            .then(data => {
                if (data.error) {

                    toast.error(data.error);
                    console.log(formData)
                } else {

                    toast.success(data.mensaje);
                    window.location.reload();
                }
            })
            .catch(error => {
                console.log(error)
                toast.error(error.message);
                console.log(formData)
                console.log(idServicio)
            });
    };

    const handleSectionChange = (section) => {
        setSelectedSection(section);
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
                console.log(data.categorias)
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

    async function guardarCambios(idServicio) {
        try {
            await handleEditarImagenBanner(idServicio);
            await handleUpdateText(idServicio);
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            toast.error('Error al guardar los cambios');
        }
    }
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
    return (
        <div>

            <ToastContainer />
            <div className='deFlexContent'>

                <div className='deFlex2'>
                    <NewServicio />
                    <button className='excel' onClick={descargarExcel}><FontAwesomeIcon icon={faArrowDown} /> Excel</button>
                    <button className='pdf' onClick={descargarPDF}><FontAwesomeIcon icon={faArrowDown} /> PDF</button>
                </div>
                <div className='filtrosContain'>
                    <div className='inputsColumn'>
                        <button  >{String(filtrados?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} / {String(servicios?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} </button>
                    </div>
                    <div className='inputsColumn'>
                        <input type="number" value={filtroId} onChange={(e) => setFiltroId(e.target.value)} placeholder='Id' />
                    </div>

                    <div className='inputsColumn'>
                        <input type="text" value={filtroTitulo} onChange={(e) => setFiltroTitulo(e.target.value)} placeholder='Titulo' />
                    </div>

                    <div className='inputsColumn'>
                        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                            <option value="">Categorias</option>
                            {
                                categorias?.map(item => (
                                    <option value={item?.idCategoria}>{item?.categoria}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className='inputsColumn'>
                        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="">Estado</option>
                            <option value="Disponible">Disponible</option>
                            <option value="No-Disponible">No-Disponible</option>

                        </select>
                    </div>

                    <button className='reload' onClick={recargar}><FontAwesomeIcon icon={faSync} /></button>
                    <button className='reverse' onClick={invertirOrden}>
                        {ordenInvertido ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
                    </button>

                </div>

            </div>


            {modalImagenVisible && (
                <div className="modalImg">
                    <div className="modal-contentImg">


                        <span className="close2" onClick={cerrarModalImagen}>
                            &times;
                        </span>

                        <img src={imagenSeleccionada} alt="Imagen Seleccionada" />
                    </div>
                </div>
            )}

            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>

                            <div className='deFlexBtnsModal'>
                                <button
                                    className={selectedSection === 'texto' ? 'selected' : ''}
                                    onClick={() => handleSectionChange('texto')}
                                >
                                    Editar Texto
                                </button>
                            </div>
                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset id='titulo'>
                                    <legend>Titulo (*)</legend>
                                    <input
                                        type="text"
                                        value={nuevoTitulo}
                                        onChange={(e) => setNuevoTitulo(e.target.value)}
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
                                        {
                                            categorias
                                                ?.filter(categoriaFiltrada => categoriaFiltrada?.idCategoria === servicio?.idCategoria)
                                                ?.map(categoriaFiltrada => (

                                                    <option value={servicio?.categoria}>{categoriaFiltrada?.categoria}
                                                        {subcategorias
                                                            ?.filter(subcategoriaFiltrada => subcategoriaFiltrada.idSubCategoria === servicio.idSubCategoria)
                                                            ?.map(subcategoriaFiltrada => (
                                                                <>
                                                                    {` >`} {subcategoriaFiltrada?.subcategoria}
                                                                </>
                                                            ))
                                                        }

                                                    </option>
                                                ))
                                        }
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
                                        value={nuevoPrecio}
                                        onChange={(e) => setNuevoPrecio(e.target.value)}
                                    />
                                </fieldset>


                                <fieldset>
                                    <legend>Estado (*)</legend>
                                    <select
                                        value={nuevoEstado !== '' ? nuevoEstado : servicio.estado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <option value={servicio.estado}>{servicio.estado}</option>
                                        <option value="Disponible">Disponible</option>
                                        <option value="No-Disponible">No-Disponible</option>
                                    </select>
                                </fieldset>

                                <fieldset id='descripcion'>
                                    <legend>Descripcion </legend>
                                    <textarea
                                        type="text"
                                        value={nuevaDescripcion}
                                        onChange={(e) => setNuevaDescripcion(e.target.value)}
                                    />
                                </fieldset>


                            </div>
                            <label id='textLabel'>Imagenes</label>
                            <div className='previevProduct'>

                                {imagenPreview ? (
                                    <img src={imagenPreview} alt="Vista previa de la imagen" onClick={() => abrirModalImagenSeleccionada(servicio.imagen1)} />
                                ) : (
                                    <>
                                        {servicio.imagen1 ? (
                                            <img src={servicio.imagen1} alt="imagen" onClick={() => abrirModalImagenSeleccionada(servicio.imagen1)} />

                                        ) : (
                                            <span className='imgNone'>
                                                No hay imagen

                                            </span>
                                        )}
                                    </>
                                )}

                            </div>

                            <div className='image-container'>
                                <div className='image-input'>
                                    <img
                                        src={imageIcon}
                                        alt="Imagen de ejemplo"
                                        className='image-icon'
                                        onClick={() => document.getElementById('fileInput1').click()} // Al hacer clic, simula un clic en el input
                                    />
                                    <input
                                        id="fileInput1"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }} // Oculta el input
                                        onChange={(e) => handleFileChange(e, setNuevaImagen, setImagenPreview)}
                                    />
                                </div>


                            </div>
                            <button className='btnPost' onClick={() => guardarCambios(servicio.idServicio)} >Guardar </button>

                        </div>

                        <div className='sectionImg' style={{ display: selectedSection === 'imagenes' ? 'flex' : 'none' }}>

                            <button className='btnPost' onClick={() => handleEditarImagenBanner(servicio.idServicio)}>Guardar </button>

                        </div>



                    </div>
                </div>
            )}
            <div className='table-container'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Titulo</th>
                            <th>Precio</th>
                            <th>Categoria</th>
                            <th>Subcategoria</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados?.slice(0, visibleCount)?.map(item => (
                            <tr key={item.idServicio}>

                                <td>
                                    {item.imagen1 ? (
                                        <img src={item.imagen1} alt="imagen1" />
                                    ) : (
                                        <span className='imgNonetd'>
                                            Sin imagen
                                        </span>
                                    )}
                                </td>
                                <td>{item.titulo}</td>

                                <td style={{
                                    color: '#008000',
                                }}>
                                    {moneda} {`${item?.precio}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                </td>

                                {categorias
                                    ?.filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                    ?.map(categoriaFiltrada => (
                                        <td
                                            key={categoriaFiltrada.idCategoria}
                                            style={{ color: '#DAA520' }}
                                        >
                                            {categoriaFiltrada.categoria}
                                        </td>
                                    ))
                                }
                                <td>
                                    {item.idSubCategoria === 0
                                        ? 'sin seleccionar'
                                        :
                                        <>
                                            {subcategorias
                                                ?.filter(subcategoriaFiltrada => subcategoriaFiltrada.idSubCategoria === item.idSubCategoria)
                                                ?.map(subcategoriaFiltrada => (
                                                    <>
                                                        {subcategoriaFiltrada?.subcategoria}
                                                    </>
                                                ))
                                            }
                                        </>
                                    }
                                </td>


                                {item.estado === 'Disponible' ? (
                                    <td style={{ color: '#008000' }}>{item.estado}</td>
                                ) : item.estado === 'No-Disponible' ? (
                                    <td style={{ color: 'red' }}>{item.estado}</td>
                                ) : (

                                    <td>{item.estado}</td>
                                )}



                                <td>
                                    {loading ? (
                                        <></>
                                    ) : usuarioLegued?.idUsuario ? (
                                        <>
                                            {usuarioLegued?.rol === 'admin' ? (
                                                <>
                                                    <button className='eliminar' onClick={() => eliminarProducto(item.idServicio)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={() => abrirModal(item)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <Anchor className='editar' to={`/servicio/${item?.idServicio}/${item?.titulo?.replace(/\s+/g, '-')}`}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Anchor>
                                                </>
                                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                                <>
                                                    <button className='eliminar' onClick={() => eliminarProducto(item.idServicio)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={() => abrirModal(item)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <Anchor className='editar' to={`/servicio/${item?.idServicio}/${item?.titulo?.replace(/\s+/g, '-')}`}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Anchor>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button className='eliminar' onClick={() => eliminarProducto(item.idServicio)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button className='editar' onClick={() => abrirModal(item)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <Anchor className='editar' to={`/producto/${item?.idServicio}/${item?.titulo?.replace(/\s+/g, '-')}`}>
                                                <FontAwesomeIcon icon={faEye} />
                                            </Anchor>
                                        </>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
            {filtrados?.length > visibleCount && (
                <button onClick={handleShowMore} id="show-more-btn">
                    Mostrar  más </button>
            )}
        </div>
    );
};
