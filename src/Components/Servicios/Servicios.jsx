import React, { useEffect, useState } from 'react';
import './Servicios.css';
import { Link as Anchor } from 'react-router-dom';
import baseURL from '../url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import moneda from '../moneda';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import ServiciosLoading from '../ServiciosLoading/ServiciosLoading';
export default function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [loading, setLoading] = useState(true);
    SwiperCore.use([Navigation, Pagination, Autoplay]);

    useEffect(() => {
        cargarServicios();
        cargarCategoria();
        cargarSubcategorias();
    }, []);

    useEffect(() => {
        // Seleccionar el primer tipo de servicio por defecto al cargar servicios
        if (servicios.length > 0 && !tipoSeleccionado) {
            const tipos = [...new Set(servicios.map(servicio => servicio.tipo))];
            setTipoSeleccionado(tipos[0]);
        }
    }, [servicios]);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
                setLoading(false);
            })
            .catch(error => console.error('Error al cargar servicios:', error));
    };

    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                const categoriasOrdenadas = (data?.categorias || [])?.sort((a, b) => a.orden - b.orden);
                setCategorias(categoriasOrdenadas);
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    const cargarSubcategorias = () => {
        fetch(`${baseURL}/subCategoriaGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setSubcategorias(data.subcategorias || []);
            })
            .catch(error => console.error('Error al cargar subcategorías:', error));
    };

    // Obtener lista única de tipos de servicios
    const tiposDeServicios = [...new Set(servicios?.map(servicio => servicio.tipo))];

    // Filtrar servicios por tipo seleccionado
    const serviciosFiltrados = servicios?.filter(servicio => servicio.tipo === tipoSeleccionado);

    // Filtrar servicios por categoría seleccionada
    const serviciosFiltradosPorCategoria = categoriaSeleccionada
        ? serviciosFiltrados?.filter(servicio => servicio.idCategoria === categoriaSeleccionada)
        : serviciosFiltrados;


    return (
        <div id='Servicios' >

            {loading ? (
                <ServiciosLoading />
            ) : (
                <div>
                    <div className="filtrosTipos">
                        {tiposDeServicios?.map(tipo => (
                            <button
                                key={tipo}
                                className={`filtroBoton ${tipo === tipoSeleccionado ? 'activo' : ''}`}
                                onClick={() => setTipoSeleccionado(tipo)}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                    <div className="filtrosCategorias">
                        {
                            servicios.length > 0 &&
                            <input
                                type="button"
                                className={`categoriaBoton ${!categoriaSeleccionada ? 'activeCategoria' : ''}`}
                                onClick={() => setCategoriaSeleccionada(null)}
                                value="Todo"
                            />
                        }
                        {categorias?.map(categoria => (
                            <input
                                type="button"
                                value={categoria.categoria}
                                key={categoria.idCategoria}
                                className={`categoriaBoton ${categoriaSeleccionada === categoria.idCategoria ? 'activeCategoria' : ''}`}
                                onClick={() => setCategoriaSeleccionada(categoria.idCategoria)}
                            />
                        ))}
                    </div>

                    {categorias
                        ?.filter(categoria =>
                            serviciosFiltradosPorCategoria?.some(servicio => servicio.idCategoria === categoria.idCategoria)
                        )
                        ?.map(categoria => (
                            <div key={categoria.idCategoria} className="categoriaSection">
                                {/* Mostrar h2 solo si no hay categoría seleccionada */}
                                {!categoriaSeleccionada && (
                                    <h2>
                                        {categoria.categoria} <FontAwesomeIcon icon={faAngleDoubleRight} className="iconCardh2" />
                                    </h2>
                                )}

                                {!categoriaSeleccionada ? (
                                    <Swiper
                                        effect={'coverflow'}
                                        grabCursor={true}
                                        slidesPerView={'auto'}
                                        id="cardsServicio"
                                        autoplay={{ delay: 3000 }}
                                    >
                                        {serviciosFiltrados
                                            ?.filter(servicio => servicio.idCategoria === categoria.idCategoria)
                                            ?.map(servicio => (
                                                <SwiperSlide key={servicio.idServicio} id="cardServicio">
                                                    <Anchor
                                                        to={`servicio/${servicio.idServicio}/${servicio?.titulo?.replace(/\s+/g, '-')}`}
                                                    >
                                                        {subcategorias?.filter(subcategoria => subcategoria.idCategoria === categoria.idCategoria && subcategoria.idSubCategoria === servicio.idSubCategoria)?.map(item => (
                                                            <h6 className="subcategoria">
                                                                {item.subcategoria}
                                                            </h6>
                                                        ))}
                                                        <div className='imgCard'>
                                                            <img src={servicio.imagen1} alt={servicio.titulo} />
                                                        </div>

                                                        <div className="cardServicioText">
                                                            <h3>{servicio.titulo}</h3>
                                                            <span>{servicio.descripcion}</span>

                                                            <div className="deFlexCard">
                                                                <strong>
                                                                    {moneda} {String(servicio?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                                </strong>
                                                                <FontAwesomeIcon icon={faAngleDoubleRight} className="iconCard" />
                                                            </div>
                                                        </div>
                                                    </Anchor>
                                                </SwiperSlide>
                                            ))}
                                    </Swiper>
                                ) : (
                                    // Si hay una categoría seleccionada, mostrar las cards sin swiper
                                    <div className="serviciosLista">
                                        {serviciosFiltradosPorCategoria
                                            ?.filter(servicio => servicio.idCategoria === categoria.idCategoria)
                                            ?.map(servicio => (
                                                <div key={servicio.idServicio} id="cardServicio">
                                                    <Anchor to={`servicio/${servicio.idServicio}/${servicio?.titulo?.replace(/\s+/g, '-')}`}>
                                                        {subcategorias?.filter(subcategoria => subcategoria.idCategoria === categoria.idCategoria && subcategoria.idSubCategoria === servicio.idSubCategoria)?.map(item => (
                                                            <h6 className="subcategoria">
                                                                {item.subcategoria}
                                                            </h6>
                                                        ))}
                                                        <div className='imgCard'>
                                                            <img src={servicio.imagen1} alt={servicio.titulo} />
                                                        </div>

                                                        <div className="cardServicioText">
                                                            <h3>{servicio.titulo}</h3>
                                                            <span>{servicio.descripcion}</span>

                                                            <div className="deFlexCard">
                                                                <strong>
                                                                    {moneda} {String(servicio?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                                </strong>
                                                                <FontAwesomeIcon icon={faAngleDoubleRight} className="iconCard" />
                                                            </div>
                                                        </div>
                                                    </Anchor>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}


                </div>
            )}

        </div>
    );
}
