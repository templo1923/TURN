import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import baseURL from '../url';
import './Favoritos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHeart } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from "react-router-dom";
import moneda from '../moneda';

export default function Favoritos() {
    const [favoritos, setFavoritos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        cargarServicios();
        cargarFavoritos();
    }, [isFocused]);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar servicios:', error);
                setLoading(false);
            });
    };

    const cargarFavoritos = () => {
        const storedFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        setFavoritos(storedFavoritos);
    };

    const obtenerImagen = (item) => {
        return item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || null;
    };

    const openModal = () => {
        setModalIsOpen(true);
        setIsFocused(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setIsFocused(false);
    };

    const eliminarServicio = (id) => {
        const updatedFavoritos = favoritos.filter(itemId => itemId !== id);
        setFavoritos(updatedFavoritos);
        localStorage.setItem('favoritos', JSON.stringify(updatedFavoritos));
    };

    return (
        <div>
            <button onClick={openModal} className='cartIcon'><FontAwesomeIcon icon={faHeart} /></button>

            <Modal
                isOpen={modalIsOpen}
                className="modal-cart"
                overlayClassName="overlay-cart"
                onRequestClose={closeModal}
            >
                <div className='deFLex'>
                    <button onClick={closeModal}><FontAwesomeIcon icon={faArrowLeft} /></button>
                    <button onClick={closeModal} className='deleteToCart'>Favoritos</button>
                </div>
                {favoritos?.length === 0 ? (
                    <p className='nohay'>No hay favoritos</p>
                ) : (
                    <div className="modal-content-cart">
                        {loading ? (
                            <p>Cargando...</p>
                        ) : (
                            <div>
                                {favoritos.map((id) => {
                                    const servicio = servicios.find(serv => serv.idServicio === id);
                                    if (!servicio) return null;
                                    return (
                                        <div key={servicio.idServicio} className='cardProductCart'>
                                            <Anchor to={`/servicio/${servicio?.idServicio}/${servicio?.titulo?.replace(/\s+/g, '-')}`} onClick={closeModal} >
                                                <img src={obtenerImagen(servicio)} alt="imagen" />
                                            </Anchor>
                                            <div className='cardProductCartText'>
                                                <h3>{servicio.titulo}</h3>
                                                <span>{servicio.categoria}</span>
                                                <strong>{moneda} {servicio?.precio?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</strong>
                                            </div>
                                            <button onClick={() => eliminarServicio(id)} className='deleteFav'><FontAwesomeIcon icon={faHeart} /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
