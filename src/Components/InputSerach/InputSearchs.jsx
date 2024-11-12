import React, { useState, useEffect } from "react";
import "./InputSearchs.css";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import baseURL from '../url';
import { useMediaQuery } from '@react-hook/media-query';

export default function InputSearchs() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredResults, setFilteredResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const isScreenLarge = useMediaQuery('(min-width: 1024px)');
    const [servicios, setServicios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [visibleServices, setVisibleServices] = useState({});

    useEffect(() => {
        cargarServicios();
        cargarCategorias();
    }, []);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
            })
            .catch(error => console.error('Error al cargar servicios:', error));
    };

    const cargarCategorias = () => {
        fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setCategorias(data.categorias || []);
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchTerm(searchTerm);

        const filteredResults = categorias.map((categoria) => {
            const serviciosFiltrados = servicios.filter((servicio) => {
                return (
                    servicio.idCategoria === categoria.idCategoria &&
                    (servicio.titulo.toLowerCase().includes(searchTerm) ||
                        categoria.categoria.toLowerCase().includes(searchTerm))
                );
            });

            return serviciosFiltrados.length > 0 ? { categoria, servicios: serviciosFiltrados } : null;
        }).filter(result => result !== null);

        setFilteredResults(filteredResults);
        setShowResults(searchTerm !== "");
        setNoResults(searchTerm !== "" && filteredResults.length === 0);
    };

    const handleShowMore = (categoria) => {
        setVisibleServices(prev => ({
            ...prev,
            [categoria?.idCategoria]: (prev[categoria?.idCategoria] || 5) + 5
        }));
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div className="fondo-input">
            {isScreenLarge ? (
                <div className="search-container">
                    <fieldset className="inputSearch">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="input"
                        />
                    </fieldset>
                    {showResults && (
                        <div className="modalSearch">
                            {filteredResults.map(({ categoria, servicios }) => (
                                <div key={categoria.idCategoria} className="sectionSearch">
                                    <h3>{categoria.categoria}</h3>
                                    <hr />
                                    {servicios?.slice(0, visibleServices[categoria?.idCategoria] || 5).map((servicio) => (
                                        <div key={servicio.idServicio}>
                                            <a href={`/servicio/${servicio.idServicio}/${servicio.titulo.replace(/\s+/g, '-')}`} onClick={closeModal}>
                                                <img src={servicio.imagen1} alt="" />
                                                <p>{servicio.titulo}</p>
                                            </a>
                                        </div>
                                    ))}
                                    {servicios?.length > (visibleServices[categoria?.idCategoria] || 5) && (
                                        <button onClick={() => handleShowMore(categoria)} className="show-more-btn2">Mostrar más</button>
                                    )}
                                </div>
                            ))}
                            {noResults && <p>No se encontraron resultados.</p>}
                        </div>
                    )}
                </div>
            ) : (
                <div className="search-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" onClick={openModal} />
                    <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modalInput" overlayClassName="overlayInput">
                        <fieldset className="inputSearch">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="input"
                            />
                        </fieldset>
                        {showResults && (
                            <div className="modalSearch">
                                {filteredResults.map(({ categoria, servicios }) => (
                                    <div key={categoria.idCategoria} className="sectionSearch">
                                        <h3>{categoria.categoria}</h3>
                                        <hr />
                                        {servicios?.slice(0, visibleServices[categoria?.idCategoria] || 5).map((servicio) => (
                                            <div key={servicio.idServicio}>
                                                <Link to={`/servicio/${servicio.idServicio}/${servicio.titulo.replace(/\s+/g, '-')}`} onClick={closeModal}>
                                                    <img src={servicio.imagen1} alt="" />
                                                    <p>{servicio.titulo}</p>
                                                </Link>
                                            </div>
                                        ))}
                                        {servicios?.length > (visibleServices[categoria?.idCategoria] || 5) && (
                                            <button onClick={() => handleShowMore(categoria)} className="show-more-btn2">Mostrar más</button>
                                        )}
                                    </div>
                                ))}
                                {noResults && <p>No se encontraron resultados.</p>}
                            </div>
                        )}
                    </Modal>
                </div>
            )}
        </div>
    );
}
