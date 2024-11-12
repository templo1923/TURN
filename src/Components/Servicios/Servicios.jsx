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
export default function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    SwiperCore.use([Navigation, Pagination, Autoplay]);
    useEffect(() => {
        cargarServicios();
        cargarCategoria();
    }, []);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
            })
            .catch(error => console.error('Error al cargar servicios:', error));
    };

    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => setCategorias(data.categorias || []))
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    // Filtrar las categorías que tienen al menos un servicio asociado
    const categoriasConServicios = categorias.filter(categoria =>
        servicios.some(servicio => servicio.idCategoria === categoria.idCategoria)
    );

    return (
        <div id='Servicios'>
            {categoriasConServicios.map(categoria => (
                <div key={categoria.idCategoria} className='categoriaSection'>
                    <h2>{categoria.categoria}  <FontAwesomeIcon icon={faAngleDoubleRight} className='iconCardh2' /></h2>

                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        slidesPerView={'auto'}
                        id='cardsServicio'
                        autoplay={{ delay: 3000 }}>

                        {servicios
                            .filter(servicio => servicio.idCategoria === categoria.idCategoria)
                            .map(servicio => (
                                <SwiperSlide id='cardServicio'>
                                    <Anchor
                                        key={servicio.idServicio}
                                        to={`servicio/${servicio.idServicio}/${servicio.titulo}`}
                                    >
                                        <img src={servicio.imagen1} alt={servicio.titulo} />
                                        <div className='cardServicioText'>
                                            <h3>{servicio.titulo}</h3>
                                            <span>{servicio.descripcion}</span>
                                            <div className='deFlexCard'>
                                                <strong> {moneda}  {servicio.precio}</strong>     <FontAwesomeIcon icon={faAngleDoubleRight} className='iconCard' />
                                            </div>
                                        </div>
                                    </Anchor>
                                </SwiperSlide>
                            ))}
                    </Swiper>

                </div>
            ))
            }
        </div >

    );
}
