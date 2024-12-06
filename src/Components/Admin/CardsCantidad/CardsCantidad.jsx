import React, { useEffect, useState } from 'react';
import './CardsCantidad.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBook, faImage, faAddressBook, faList, faClipboardList, faRectangleList, faTag, faBuilding } from '@fortawesome/free-solid-svg-icons'; // Importa los íconos necesarios
import { Link as Anchor } from "react-router-dom";
import baseURL from '../../url';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
export default function CardsCantidad() {
    const [servicios, setServicios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [turnos, setTurnos] = useState([]);


    useEffect(() => {
        cargarServicios();
        cargarUsuarios();
        cargarBanners();
        cargarCategoria();
        cargarTurnos();
    }, []);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
            })
            .catch(error => console.error('Error al cargar servicios:', error));
    };


    const cargarUsuarios = () => {
        fetch(`${baseURL}/usuariosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setUsuarios(data.usuarios || []);
            })
            .catch(error => console.error('Error al cargar usuarios:', error));
    };

    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setBanners(data.banner || []);
                console.log(data.banner)
            })
            .catch(error => console.error('Error al cargar banners:', error));
    };


    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategorias(data.categorias || []);
                console.log(data.categorias)
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    };


    const cargarTurnos = () => {
        fetch(`${baseURL}/turnoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTurnos(data.turnos || []);
            })
            .catch(error => console.error('Error al cargar turnos:', error));
    };

    return (
        <div className='CardsCantidad'>
            <Anchor to={`/dashboard/usuarios`} className='cardCantidad'>
                <FontAwesomeIcon icon={faUser} className='icons' />
                <div className='deColumn'>
                    <h3>Usuarios</h3>
                    <h2>{usuarios.length}</h2>
                </div>
            </Anchor>

            <Anchor to={`/dashboard/servicios`} className='cardCantidad'>
                <FontAwesomeIcon icon={faProductHunt} className='icons' />
                <div className='deColumn'>
                    <h3>Servicios</h3>
                    <h2>{servicios.length}</h2>
                </div>
            </Anchor>


            <Anchor to={`/dashboard/categorias`} className='cardCantidad'>
                <FontAwesomeIcon icon={faList} className='icons' />
                <div className='deColumn'>
                    <h3>Categorías</h3>
                    <h2>{categorias.length}</h2>
                </div>
            </Anchor>


            <Anchor to={`/dashboard/turnos`} className='cardCantidad'>
                <FontAwesomeIcon icon={faRectangleList} className='icons' />
                <div className='deColumn'>
                    <h3>Turnos</h3>
                    <h2>{turnos.length}</h2>
                </div>
            </Anchor>

        </div>
    );
}
