import React, { useState, useEffect } from 'react';
import './NavbarDashboard.css';
import { Link as Anchor, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faUsers, faImage, faChevronDown, faChevronUp, faCode, faClipboardList, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faGauge, faStore, faList, faRectangleList, faBuilding, faTag } from '@fortawesome/free-solid-svg-icons';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { fetchUsuario, getUsuario } from '../../user';
import logo from '../../../images/logo.png';
import Logout from '../Logout/Logout';
import baseURL from '../../url';

export default function Navbar() {
    const location = useLocation();
    const [tienda, setTienda] = useState([]);
    const [expanded, setExpanded] = useState(false); // Estado para controlar la expansión
    const [detallesVisibles, setDetallesVisibles] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        cargarTienda();
    }, []);

    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTienda(data.tienda.reverse()[0] || []);
            })
            .catch(error => console.error('Error al cargar datos:', error));
    };

    const handleToggleNavbar = () => {
        setExpanded(!expanded); // Alternar el estado de expansión
    };

    const toggleDetalles = () => {
        setDetallesVisibles(!detallesVisibles)
    };

    //Trae usuario logueado-----------------------------
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario(); // Llama a la función para obtener datos del usuario
            setLoading(false);
        };

        fetchData();
    }, []);

    const usuarioLegued = getUsuario();
    return (
        <div className={`navbarDashboard ${expanded ? 'expanded' : ''}`}>

            <Anchor className='logo' id='logo'  >
                <div className='logo' >
                    {tienda?.imagen1 ? (
                        <img src={tienda?.imagen1} alt="logo" />
                    ) : (
                        <img src={logo} alt="logo" />
                    )}
                    <div className='deColumnNav'>
                        {tienda?.nombre ? (
                            <ss>{tienda?.nombre}</ss>
                        ) : (
                            <ss>Tienda</ss>
                        )}
                        {tienda?.email ? (
                            <ss>{tienda?.email}</ss>
                        ) : (
                            <ss>email@gmail.com</ss>
                        )}
                    </div>
                </div>
                <button onClick={handleToggleNavbar} className="nav_toggle2">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

            </Anchor>

            {loading ? (
                <></>
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <div className='links'>
                            <Anchor to={`/dashboard`} className={location.pathname === '/dashboard' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faGauge} /> Dashboard
                            </Anchor>
                            <Anchor to={`/dashboard/contacto`} className={location.pathname === '/dashboard/contacto' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faUsers} /> Contacto
                            </Anchor>


                            <Anchor to={`/dashboard/categorias`} className={location.pathname === '/dashboard/categorias' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faList} /> Categorías
                            </Anchor>

                            <Anchor to={`/dashboard/servicios`} className={location.pathname === '/dashboard/servicios' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faProductHunt} /> Servicios
                            </Anchor>

                            <Anchor to={`/dashboard/turnos`} className={location.pathname === '/dashboard/turnos' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faRectangleList} /> Turnos
                            </Anchor>
                            <Anchor to={`/dashboard/banners`} className={location.pathname === '/dashboard/banners' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faImage} /> Banners
                            </Anchor>

                            <Anchor to={`/dashboard/usuarios`} className={location.pathname === '/dashboard/usuarios' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faUser} /> Usuarios
                            </Anchor>
                        </div>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <div className='links'>
                            <Anchor to={`/dashboard`} className={location.pathname === '/dashboard' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faGauge} /> Dashboard
                            </Anchor>
                            <Anchor to={`/dashboard/contacto`} className={location.pathname === '/dashboard/contacto' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faUsers} /> Contacto
                            </Anchor>


                            <Anchor to={`/dashboard/categorias`} className={location.pathname === '/dashboard/categorias' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faList} /> Categorías
                            </Anchor>

                            <Anchor to={`/dashboard/servicios`} className={location.pathname === '/dashboard/servicios' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faProductHunt} /> Servicios
                            </Anchor>

                            <Anchor to={`/dashboard/turnos`} className={location.pathname === '/dashboard/turnos' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faRectangleList} /> Turnos
                            </Anchor>
                            <Anchor to={`/dashboard/banners`} className={location.pathname === '/dashboard/banners' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faImage} /> Banners
                            </Anchor>

                            <Anchor to={`/dashboard/usuarios`} className={location.pathname === '/dashboard/usuarios' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faUser} /> Usuarios
                            </Anchor>
                        </div>
                    ) : (
                        <div className='links'>
                            <Anchor to={`/dashboard`} className={location.pathname === '/dashboard' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faGauge} /> Dashboard
                            </Anchor>
                            <Anchor to={`/dashboard/contacto`} className={location.pathname === '/dashboard/contacto' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faUsers} /> Contacto
                            </Anchor>


                            <Anchor to={`/dashboard/categorias`} className={location.pathname === '/dashboard/categorias' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faList} /> Categorías
                            </Anchor>

                            <Anchor to={`/dashboard/servicios`} className={location.pathname === '/dashboard/servicios' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faProductHunt} /> Servicios
                            </Anchor>

                            <Anchor to={`/dashboard/turnos`} className={location.pathname === '/dashboard/turnos' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faRectangleList} /> Turnos
                            </Anchor>
                            <Anchor to={`/dashboard/banners`} className={location.pathname === '/dashboard/banners' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faImage} /> Banners
                            </Anchor>

                            <Anchor to={`/dashboard/usuarios`} className={location.pathname === '/dashboard/usuarios' ? 'activeLink' : ''}>
                                <FontAwesomeIcon icon={faUser} /> Usuarios
                            </Anchor>
                        </div>
                    )}
                </>
            ) : (
                <div className='links'>
                    <Anchor to={`/dashboard`} className={location.pathname === '/dashboard' ? 'activeLink' : ''}>
                        <FontAwesomeIcon icon={faGauge} /> Dashboard
                    </Anchor>
                    <Anchor to={`/dashboard/contacto`} className={location.pathname === '/dashboard/contacto' ? 'activeLink' : ''}>
                        <FontAwesomeIcon icon={faUsers} /> Contacto
                    </Anchor>


                    <Anchor to={`/dashboard/categorias`} className={location.pathname === '/dashboard/categorias' ? 'activeLink' : ''}>
                        <FontAwesomeIcon icon={faList} /> Categorías
                    </Anchor>

                    <Anchor to={`/dashboard/servicios`} className={location.pathname === '/dashboard/servicios' ? 'activeLink' : ''}>
                        <FontAwesomeIcon icon={faProductHunt} /> Servicios
                    </Anchor>

                    <Anchor to={`/dashboard/turnos`} className={location.pathname === '/dashboard/turnos' ? 'activeLink' : ''}>
                        <FontAwesomeIcon icon={faRectangleList} /> Turnos
                    </Anchor>
                    <Anchor to={`/dashboard/banners`} className={location.pathname === '/dashboard/banners' ? 'activeLink' : ''}>
                        <FontAwesomeIcon icon={faImage} /> Banners
                    </Anchor>

                    <Anchor to={`/dashboard/usuarios`} className={location.pathname === '/dashboard/usuarios' ? 'activeLink' : ''}>
                        <FontAwesomeIcon icon={faUser} /> Usuarios
                    </Anchor>
                </div>
            )}




            <Logout />
        </div>
    );
}
