import React, { useState, useEffect } from 'react';
import './NewBanner.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import imageIcon from '../../../images/imageIcon.png';

export default function NewBanner() {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [isImageSelected, setIsImageSelected] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    const handleImagenChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagenPreview(previewURL);
            setIsImageSelected(true);
        }
    };

    const eliminarImagen = () => {
        setImagenPreview(null);
        setIsImageSelected(false);
    };

    const crear = async () => {
        const form = document.getElementById("crearForm");
        const formData = new FormData(form);
        const resetForm = () => {
            form.reset();
            setImagenPreview(null);
            setIsImageSelected(false);
        };
        setMensaje('');

        if (!formData.get('imagen')) {
            toast.error('Por favor, seleccione una imagen.');
            return;
        }

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/bannersPost.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                resetForm();
                toast.success(data.mensaje);
                window.location.reload();
            } else if (data.error) {
                setMensaje('');
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            toast.error('Error de conexión. Por favor, inténtelo de nuevo.');
        }
    };



    return (
        <div className='NewContain'>
            <ToastContainer />
            <button onClick={toggleModal} className='btnSave'>
                <span>+</span> Agregar
            </button>
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Banner</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <legend className='legenda'>Para obtener una mejor calidad de visualización, sugerimos que las imágenes tengan una resolución de aproximadamente 1600 x 900 píxeles y se guarden en formatos .JPG o .PNG.</legend>
                        <form id="crearForm">
                            <div className="flexGrap">
                                <input
                                    type="file"
                                    id="imagen"
                                    name="imagen"
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                    style={{ display: 'none' }} // Ocultar input file
                                    required
                                />
                                <label htmlFor="imagen" className={`image-banner-label ${isImageSelected ? 'selectedImage' : ''}`}>
                                    {isImageSelected ? (
                                        <img src={imagenPreview} alt="Vista previa" className='image-banner-prev' />
                                    ) : (
                                        <img src={imageIcon} alt="Seleccionar imagen" className='image-banner' />
                                    )}
                                </label>
                                {/* {isImageSelected && (
                                    <button type="button" onClick={eliminarImagen} className='eliminar-imagen'>
                                        Eliminar
                                    </button>
                                )} */}
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
