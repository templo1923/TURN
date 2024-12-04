import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './Detail.css';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExternalLinkAlt, faStar, faHeart, faUser } from '@fortawesome/free-solid-svg-icons';
import baseURL from '../url';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DetailLoading from "../DetailLoading/DetailLoading";
import moneda from '../moneda';
import Dias from "../Dias/Dias";
import { Link as Anchor } from 'react-router-dom';
import MiTurno from '../MiTurno/MiTurno'
import { useMediaQuery } from '@react-hook/media-query';
export default function Detail() {
    const navigate = useNavigate();
    const { idServicio } = useParams();
    const [servicio, setServicio] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tienda, setTienda] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubCategorias] = useState([]);
    const categoriasInputRef = useRef(null);
    const [fixedCategories, setFixedCategories] = useState(false);
    const location = useLocation();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const toggleDescriptionExpanded = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    const isScreenLarge = useMediaQuery('(min-width: 1024px)');
    useEffect(() => {
        cargarServicios();
        cargarTienda();
        cargarCategoria();
        cargarFavoritos();
        cargarSubCategoria();

    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleScroll = () => {
        if (categoriasInputRef.current) {
            setFixedCategories(window.scrollY > categoriasInputRef.current.offsetTop);
        }
    };

    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => setCategorias(data.categorias || []))
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    const cargarSubCategoria = () => {
        fetch(`${baseURL}/subCategoriaGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => setSubCategorias(data.subcategorias || []))
            .catch(error => console.error('Error al cargar subcategorías:', error));
    };

    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => setTienda(data.tienda.reverse() || []))
            .catch(error => console.error('Error al cargar tienda:', error));
    };

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar servicios:', error);
                setLoading(true);
            });
    };

    useEffect(() => {
        const service = servicios.find(e => e.idServicio === parseInt(idServicio));
        setServicio(service);
    }, [idServicio, servicios]);
    const cargarFavoritos = () => {
        const storedFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        setFavoritos(storedFavoritos);
    };
    const handleCompartirClick = () => {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: 'Echa un vistazo a este servicio',
                url: window.location.href,
            }).then(() => console.log('Contenido compartido correctamente'))
                .catch(error => console.error('Error al compartir:', error));
        } else {
            console.error('La API de compartir no está disponible en este navegador.');
        }
    };

    const handleWhatsappMessage = () => {
        const phoneNumber = servicio.telefono;
        const formattedPrice = Number(servicio?.precio).toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const message = `Hola 🌟, quisiera más información sobre el servicio: *${servicio?.titulo}*\n${moneda} ${formattedPrice}`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const goBack = () => {
        location.key !== 'default' ? navigate(-1) : navigate('/');
    };

    const agregarAFavoritos = (idServicio) => {
        const favList = [...favoritos];
        const index = favList.indexOf(idServicio);
        if (index === -1) {
            favList.push(idServicio);
            setFavoritos(favList);
            localStorage.setItem('favoritos', JSON.stringify(favList));
        } else {
            favList.splice(index, 1);
            setFavoritos(favList);
            localStorage.setItem('favoritos', JSON.stringify(favList));
        }
    };


    if (!servicio) {
        return <DetailLoading />;
    }

    return (
        <div className="detail">
            <ToastContainer />
            <div className={`deFlexDetail ${fixedCategories ? 'fixedHeader' : ''}`} ref={categoriasInputRef}>
                <button className="back" onClick={goBack}> <FontAwesomeIcon icon={faArrowLeft} /> </button>
                <div className="deFLexIcon">
                    <button onClick={() => agregarAFavoritos(servicio.idServicio)} className='favoritos-btn'>
                        <FontAwesomeIcon icon={faHeart} style={{ color: favoritos.includes(servicio.idServicio) ? 'red' : 'gray' }} />
                    </button>
                    <button className="share" onClick={handleCompartirClick}> <FontAwesomeIcon icon={faExternalLinkAlt} /> </button>
                </div>
            </div>

            <div className="detail-contain">
                <div className="imgContain" onClick={() => {
                    setModalImage(servicio.imagen1);
                    setIsModalOpen(true);
                }}>
                    {servicio.imagen1 && (
                        <img
                            src={servicio.imagen1}
                            alt={servicio.titulo}
                            className="imagen1"
                            onClick={() => {
                                setModalImage(servicio.imagen1);
                                setIsModalOpen(true);
                            }}
                        />
                    )}
                </div>

                <div className="textDetail">
                    <div className="deFLexBuet">
                        {categorias
                            .filter(categoria => categoria.idCategoria === servicio.idCategoria)
                            .map(categoria => (
                                <h4 key={categoria.idCategoria}>
                                    <FontAwesomeIcon icon={faStar} />
                                    {`${servicio.tipo} > `}
                                    {categoria.categoria}
                                    {subcategorias
                                        .filter(sub => sub.idSubCategoria === servicio.idSubCategoria)
                                        .map(sub => ` > ${sub.subcategoria} `)
                                    }
                                    {` > ${moneda} ${String(servicio?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`}
                                </h4>
                            ))
                        }
                    </div>
                    <h2 className="title">{servicio.titulo}</h2>
                    <div className="deFlexContentDetail">
                        <div className="userProfile">
                            <FontAwesomeIcon icon={faUser} className="iconUser" />
                            <div>
                                <h4> Profesional </h4>
                                <h5>
                                    {servicio.nombre}
                                </h5>
                            </div>
                        </div>
                        <div className="deFlexBtnDetail">

                            <Anchor className="emailBtn" to={`https://www.google.com/maps?q=${encodeURIComponent(servicio.direccion)}`} target="_blank">
                                <span>Dirección</span> <i className="fa fa-map-marker"></i>
                            </Anchor>

                            <Anchor to={`mailto:${servicio.email}`} className="emailBtn" >
                                <span>Email</span> <i className="fa fa-envelope"></i>
                            </Anchor>

                            <button className="wpp" onClick={handleWhatsappMessage}>
                                <span>WhatsApp</span>
                                <i className='fa fa-whatsapp'></i>
                            </button>
                            <MiTurno />
                        </div>
                    </div>
                    {isScreenLarge ? (
                        <span>
                            {servicio.descripcion}
                        </span>
                    ) : (
                        <span onClick={toggleDescriptionExpanded} className="description-span">
                            {isDescriptionExpanded
                                ? servicio.descripcion
                                : servicio.descripcion.length > 80
                                    ? `${servicio.descripcion.substring(0, 80)}...`
                                    : servicio.descripcion
                            }
                            {servicio.descripcion.length > 80 && (
                                <span className="view-more-btn">
                                    {isDescriptionExpanded ? " Ver menos" : " Ver más"}
                                </span>
                            )}
                        </span>
                    )}


                </div>
                <Dias />
            </div>

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                center
                classNames={{
                    modal: 'custom-modal',
                }}
            >
                <img src={modalImage} alt={servicio.titulo} />
            </Modal>
        </div>
    );
}
