import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MiTurno.css';
import 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import baseURL from '../url';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

export default function MiTurno() {
    const [turnos, setTurnos] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [idTurno, setIdTurno] = useState(localStorage.getItem('idTurno') || '');
    const [turnoDetalle, setTurnoDetalle] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        cargarTurnos();
    }, []);

    useEffect(() => {
        // Si existe un idTurno en localStorage, intenta buscarlo automáticamente al abrir el modal
        if (idTurno) {
            buscarTurno();
        }
    }, [modalIsOpen]);

    const cargarTurnos = () => {
        fetch(`${baseURL}/turnoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTurnos(data.turnos.reverse() || []);
            })
            .catch(error => console.error('Error al cargar turnos:', error));
    };

    const openModal = () => {
        setModalIsOpen(true);
        setIsFocused(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setIsFocused(false);
        setTurnoDetalle(null);
    };

    const handleInputChange = (e) => {
        setIdTurno(e.target.value);
    };

    const buscarTurnoConAlerta = () => {
        const idTurnoInt = parseInt(idTurno, 10);
        const turnoEncontrado = turnos?.find(turno => turno.idTurno === idTurnoInt);

        if (turnoEncontrado) {
            setTurnoDetalle(turnoEncontrado);
            Swal.fire({
                title: 'Turno encontrado',
                text: `ID Turno: ${turnoEncontrado.idTurno}, Nombre: ${turnoEncontrado.nombre}`,
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        } else {
            Swal.fire({
                title: 'Turno no encontrado',
                text: 'El ID del turno no corresponde a ningún turno existente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            setTurnoDetalle(null);
        }
    };

    const buscarTurno = () => {
        const idTurnoInt = parseInt(idTurno, 10);
        const turnoEncontrado = turnos?.find(turno => turno.idTurno === idTurnoInt);

        if (turnoEncontrado) {
            setTurnoDetalle(turnoEncontrado);
        } else {
            setTurnoDetalle(null);
        }
    };

    // Función para generar y descargar el PDF
    const descargarTurnoPDF = (detallesTurno) => {
        const doc = new jsPDF();

        // Títulos principales
        doc.setFontSize(22);
        doc.setTextColor("#2c3e50");
        doc.text("Detalles del Turno", 105, 20, null, null, "center");

        // Información del turno
        doc.setFontSize(14);
        doc.setTextColor("#34495e");
        doc.text("Turno N°:", 20, 30);
        doc.setFontSize(14);
        doc.text(String(detallesTurno.idTurno), 60, 30); // Asegúrate de convertirlo en cadena

        doc.text("Servicio:", 20, 40);
        doc.setFontSize(14);
        doc.text(String(detallesTurno.servicio), 60, 40); // Asegúrate de convertirlo en cadena

        doc.setFontSize(16);
        doc.text("Días y Horarios:", 20, 50);

        // Mapeo de los días y horarios
        const dias = JSON.parse(detallesTurno.dias); // Asegúrate de parsear el JSON correctamente
        let yPos = 60; // Posición inicial en Y para los días y horarios

        dias.forEach(dia => {
            doc.setFontSize(14);
            doc.text(`Día: ${new Date(dia.dia).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })}`, 20, yPos);

            doc.text(`Horario: ${dia.horaInicio} - ${dia.horaFin}`, 20, yPos + 10); // Ajusta la posición de la siguiente línea
            yPos += 20; // Espacio entre cada día
        });

        // Información del cliente
        doc.setFontSize(18);
        doc.setTextColor("#2c3e50");
        doc.text("Datos del Cliente", 20, yPos + 10); // Ajusta la posición con el valor de `yPos`

        // Fondo para datos del cliente
        doc.setFillColor("#f7f7f7");
        doc.roundedRect(15, yPos + 15, 180, 40, 5, 5, "F");

        doc.setFontSize(14);
        doc.setTextColor("#34495e");
        doc.text("Nombre:", 20, yPos + 30);
        doc.text(String(detallesTurno.nombre), 60, yPos + 30); // Asegúrate de convertirlo en cadena

        doc.text("DNI:", 20, yPos + 40);
        doc.text(String(detallesTurno.dni), 60, yPos + 40); // Asegúrate de convertirlo en cadena

        doc.text("Teléfono:", 20, yPos + 50);
        doc.text(String(detallesTurno.telefono), 60, yPos + 50); // Asegúrate de convertirlo en cadena

        doc.text("Email:", 20, yPos + 60);
        doc.text(String(detallesTurno.email), 60, yPos + 60); // Asegúrate de convertirlo en cadena

        // Pie de página
        doc.setFontSize(12);
        doc.setTextColor("#7f8c8d");
        doc.text("Gracias por confiar en nosotros.", 105, 280, null, null, "center");
        doc.text("Para cualquier consulta, contáctanos al 123-456-789.", 105, 285, null, null, "center");

        // Descargar el PDF
        doc.save(`Turno_${detallesTurno.idTurno}_${detallesTurno.nombre}_${detallesTurno.fecha}.pdf`);
    };



    return (
        <div>
            <button onClick={openModal} className='emailBtn'><span>Mi turno </span>   <FontAwesomeIcon icon={faSearch} /></button>
            <ToastContainer />
            <Modal
                isOpen={modalIsOpen}
                className="modal-cart"
                overlayClassName="overlay-cart"
                onRequestClose={closeModal}
            >
                <div className='deFLex'>
                    <button onClick={closeModal}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <button className='deleteToCart'>Mi turno</button>
                </div>
                <div className='paddingConten'>
                    <fieldset className='inputSearch'>
                        <input
                            type="number"
                            placeholder="Ingrese N° de Turno"
                            value={idTurno}
                            onChange={handleInputChange}
                            className="input"
                        />
                        <FontAwesomeIcon icon={faSearch} onClick={buscarTurnoConAlerta} className="search-icon" />
                    </fieldset>
                </div>
                {turnoDetalle && (
                    <div className='MiPedidoContain'>
                        <div className="modal-content-cart">
                            <div className='deFlexSpanPedido'>
                                <span><strong>Turno N°:</strong> {turnoDetalle.idTurno}</span>
                                <span><strong>Servicio:</strong> {turnoDetalle.servicio}</span>
                                {JSON.parse(turnoDetalle.dias).map((dia, index) => (
                                    <div key={index} className='deFlexSpanPedido'>
                                        <span>
                                            <strong> Día: </strong>{new Date(dia.dia).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <span>
                                            <strong> Horario:</strong> {dia.horaInicio} - {dia.horaFin}
                                        </span>
                                    </div>
                                ))}

                                <span><strong>Estado:</strong> {turnoDetalle.estado}</span>
                                <span><strong>Nombre:</strong> {turnoDetalle.nombre}</span>
                                <span><strong>DNI:</strong> {turnoDetalle.dni}</span>
                                <span><strong>Email:</strong> {turnoDetalle.email}</span>
                                <span><strong>Teléfono:</strong> {turnoDetalle.telefono}</span>


                            </div>
                            <button onClick={() => descargarTurnoPDF(turnoDetalle)} className='btn'>Descargar PDF</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
