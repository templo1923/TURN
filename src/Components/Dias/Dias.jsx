import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './Dias.css';
import Modal from 'react-modal';
import baseURL from '../url';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

SwiperCore.use([Navigation, Pagination, Autoplay]);

export default function Dias() {
    const { idServicio } = useParams();
    const { servicio } = useParams();
    const [dias, setDias] = useState([]);
    const [dia, setDia] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [nombre, setNombre] = useState('');
    const [dni, setDni] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [turnos, setTurnos] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [pago, setPago] = useState('');

    useEffect(() => {
        cargarDias();
        cargarTurnos()
    }, []);

    const cargarDias = () => {
        fetch(`${baseURL}/diasGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setDias(data.dias_horarios || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar días:', error);
                setLoading(true);
            });
    };
    const cargarTurnos = () => {
        fetch(`${baseURL}/turnoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                // Filtrar turnos por idServicio y parsear los días
                const turnosConDias = data.turnos
                    ?.filter(turno => turno.idServicio === parseInt(idServicio)) // Filtrar por idServicio
                    ?.map(turno => ({
                        ...turno,
                        dias: JSON.parse(turno.dias), // Convertir la cadena JSON en un objeto
                    })) || [];
                setTurnos(turnosConDias);
            })
            .catch(error => console.error('Error al cargar turnos:', error));
    };


    useEffect(() => {
        if (dias?.length > 0) {
            const diasFilt = dias?.find(d => d.idServicio === parseInt(idServicio));
            if (diasFilt) {
                const parsedDias = JSON.parse(diasFilt.dias);
                setDia({ ...diasFilt, dias: parsedDias });

                // Seleccionar el día actual automáticamente
                const today = dayjs();
                const todayInfo = generateMonthDays()?.find(day => day.date === today.format('YYYY-MM-DD'));

                if (todayInfo) {
                    const todayIndex = generateMonthDays()?.findIndex(day => day.date === today.format('YYYY-MM-DD'));
                    const matchingDayInfo = parsedDias?.find(d => d.dia === todayInfo.day);

                    if (matchingDayInfo) {
                        setSelectedDay({ ...matchingDayInfo, date: todayInfo.date });
                        setSelectedDayIndex(todayIndex);
                    }
                }
            } else {
                setDia(null);
            }
        }
    }, [idServicio, dias]);


    const generateMonthDays = () => {
        const daysInMonth = [];
        const today = dayjs();

        // Vamos a generar los días a partir de hoy hasta 30 días después
        const endDate = today.add(30, 'day'); // 30 días después de hoy

        for (let date = today; date.isBefore(endDate); date = date.add(1, 'day')) {
            daysInMonth.push({
                day: date.format('ddd').replace('.', '').toLowerCase(),
                date: date.format('YYYY-MM-DD'),
            });
        }

        return daysInMonth;
    };


    const handleDayClick = (monthDay, index) => {
        const selectedDayInfo = dia?.dias?.find(d => d.dia === monthDay.day);
        setSelectedDay(selectedDayInfo ? { ...selectedDayInfo, date: monthDay.date } : null);
        setSelectedHorario(null);
        setSelectedDayIndex(index);
    };

    const handleHorarioClick = (horario, date) => {
        setSelectedHorario({ horario, date });
    };



    const openModal = () => {
        setModalIsOpen(true);
        setIsFocused(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setIsFocused(false);
    };
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
        doc.text(detallesTurno.idTurno, 60, 30);

        doc.text("Servicio:", 20, 40);
        doc.text(detallesTurno.servicio, 60, 40);

        doc.setFontSize(16);
        doc.text("Día:", 20, 50);
        doc.text(detallesTurno.dia, 60, 50);

        doc.text("Fecha:", 20, 60);
        doc.text(detallesTurno.fecha, 60, 60);

        doc.text("Horario:", 20, 70);
        doc.text(`${detallesTurno.horarioInicio} - ${detallesTurno.horarioFin}`, 60, 70);

        // Información del cliente
        doc.setFontSize(18);
        doc.setTextColor("#2c3e50");
        doc.text("Datos del Cliente", 20, 90);

        // Fondo para datos del cliente
        doc.setFillColor("#f7f7f7");
        doc.roundedRect(15, 95, 180, 60, 5, 5, "F");

        doc.setFontSize(14);
        doc.setTextColor("#34495e");
        doc.text("Nombre:", 20, 110);
        doc.text(detallesTurno.nombre, 60, 110);

        doc.text("DNI:", 20, 120);
        doc.text(detallesTurno.dni, 60, 120);

        doc.text("Teléfono:", 20, 130);
        doc.text(detallesTurno.telefono, 60, 130);

        doc.text("Email:", 20, 140);
        doc.text(detallesTurno.email, 60, 140);

        // Información del pago
        doc.setFontSize(18);
        doc.setTextColor("#2c3e50");
        doc.text("Detalles del Pago", 20, 165);

        // Fondo para detalles del pago
        doc.setFillColor("#f7f7f7");
        doc.roundedRect(15, 170, 180, 30, 5, 5, "F");

        doc.setFontSize(14);
        doc.setTextColor("#34495e");
        doc.text("Método de Pago:", 20, 185);
        doc.text(detallesTurno.pago, 70, 185);

        // Pie de página
        doc.setFontSize(12);
        doc.setTextColor("#7f8c8d");
        doc.text("Gracias por confiar en nosotros.", 105, 280, null, null, "center");
        doc.text("Para cualquier consulta, contáctanos al 123-456-789.", 105, 285, null, null, "center");

        // Crear nombre de archivo seguro (sin espacios ni caracteres especiales)
        const nombreArchivo = `Turno_${detallesTurno.idTurno}_${detallesTurno.nombre.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}_${detallesTurno.fecha.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.pdf`;

        // Descargar el PDF
        doc.save(nombreArchivo);
    };


    const crearTurno = async () => {
        setMensaje('Procesando...');

        try {


            // Crear el objeto de días y horas (campo dias)
            const diasData = [
                {
                    dia: selectedHorario.date,           // Ejemplo: Lunes, Martes, etc.
                    horaInicio: selectedHorario.horario.horaInicio,  // Ejemplo: '09:00'
                    horaFin: selectedHorario.horario.horaFin,
                }
            ]

            // Preparar FormData con los campos individuales
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('dni', dni);
            formData.append('telefono', telefono);
            formData.append('email', email);
            formData.append('idServicio', idServicio);
            formData.append('servicio', servicio);
            formData.append('estado', 'Pendiente');
            formData.append('pago', pago);
            formData.append('dias', JSON.stringify(diasData));  // Agregar los días y horas como JSON

            // Enviar la solicitud con los datos
            const response = await fetch(`${baseURL}/turnoPost.php`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.idTurno) {
                setMensaje('');

                Swal.fire(
                    'Turno creado!',
                    `Turno N°${data.idTurno} creado con éxito.`,
                    'success'
                );

                // Limpiar campos y cerrar modal
                setNombre('');
                setDni('');
                setTelefono('');
                setEmail('');
                setMensaje('');
                closeModal();
                cargarDias();
                cargarTurnos()
                const detallesTurno = {
                    idTurno: data.idTurno,
                    servicio,
                    dia: dayjs(selectedHorario?.date)?.format('dddd'),
                    fecha: dayjs(selectedHorario?.date)?.format('dddd, D [de] MMMM [de] YYYY'),
                    horarioInicio: selectedHorario?.horario?.horaInicio,
                    horarioFin: selectedHorario?.horario?.horaFin,
                    nombre,
                    dni,
                    telefono,
                    email,
                    pago,
                };

                descargarTurnoPDF(detallesTurno);
                setTimeout(() => {
                    setSelectedHorario(null)
                }, 100);
                setTimeout(() => {
                    window.location.reload();

                }, 2000);

            } else if (data?.error) {
                setMensaje('');
                Swal.fire(
                    'Error',
                    data?.error,
                    'error'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            Swal.fire(
                'Error',
                'Error de conexión. Por favor, inténtelo de nuevo.',
                'error'
            );
        }
    };




    if (loading) {
        return <Swiper
            effect={'coverflow'}
            grabCursor={true}
            slidesPerView={'auto'}
            id="cardsServicio"
        >
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>

            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>

            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
            <SwiperSlide id="cardDayLoading">

            </SwiperSlide>
        </Swiper>;
    }

    return (
        <div className='Dias'>
            {dia ? (
                <div>
                    {selectedDay && <div className='horariosSeleccionados'>
                        <h4>{dayjs(selectedDay?.date)?.format('dddd, D [de] MMMM [de] YYYY')}:</h4>
                    </div>
                    }
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        slidesPerView={'auto'}
                        id='cardsServicio'
                    >

                        {generateMonthDays().map((monthDay, index) => {
                            const matchingDayInfo = dia?.dias?.find(d => d.dia === monthDay?.day);

                            // Verificar si todos los horarios de un día están ocupados
                            const isDayFull = matchingDayInfo?.horarios?.every(horario =>
                                turnos?.some(turno =>
                                    turno?.dias?.some(d =>
                                        d.dia === monthDay.date &&
                                        d.horaInicio === horario.horaInicio &&
                                        d.horaFin === horario.horaFin
                                    )
                                )
                            );

                            const disponibilidadText = matchingDayInfo
                                ? isDayFull
                                    ? <div className="red"></div> // Todos los horarios están ocupados
                                    : <div className="green"></div> // Hay horarios disponibles
                                : <div className="red"></div>; // Día no tiene horarios disponibles

                            return (
                                <SwiperSlide
                                    key={index}
                                    onClick={() => handleDayClick(monthDay, index)}
                                    id={selectedDayIndex === index ? 'selectedDay' : 'cardDay'}
                                >
                                    <h5>{dayjs(monthDay.date)?.format('dddd')}</h5>
                                    <h4>{dayjs(monthDay.date)?.format('D')}</h4>
                                    <h5>{dayjs(monthDay.date)?.format('MMMM')}</h5>
                                    {disponibilidadText}
                                </SwiperSlide>
                            );
                        })}

                    </Swiper>
                    {selectedDay ? (
                        <div className='horariosSeleccionados'>
                            {/* <h4>{dayjs(selectedDay?.date)?.format('dddd, D [de] MMMM [de] YYYY')}:</h4> */}
                            <div className="flexGrapHoras">
                                {selectedDay?.horarios?.map((horario, idx) => {
                                    // Verificar si el horario está ocupado por algún turno del mismo servicio
                                    const isOcupado = turnos.some(turno =>
                                        turno.dias.some(d =>
                                            d.dia === selectedDay.date &&
                                            d.horaInicio === horario.horaInicio &&
                                            d.horaFin === horario.horaFin
                                        )
                                    );

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => !isOcupado && handleHorarioClick(horario, selectedDay.date)}
                                            style={{
                                                cursor: isOcupado ? 'not-allowed' : 'pointer',
                                                backgroundColor: isOcupado ? '#06b5b826' : '',
                                                color: isOcupado ? '#06b5b8' : '',
                                            }}
                                            disabled={isOcupado} // Desactivar si el horario está ocupado
                                        >
                                            {horario.horaInicio} - {horario.horaFin}
                                        </button>
                                    );
                                })}
                            </div>


                        </div>
                    ) : (
                        <h4 className="textCenter">Selecciona un día para ver sus horarios.</h4>
                    )}


                    {selectedHorario && (
                        <button className="btnFlotant" onClick={openModal} >Agendar turno de {selectedHorario && (
                            <>
                                {selectedHorario?.horario?.horaInicio} - {selectedHorario?.horario?.horaFin}
                            </>
                        )}
                        </button>
                    )}
                    <Modal
                        isOpen={modalIsOpen}
                        className="modal-cart"
                        overlayClassName="overlay-cart"
                        onRequestClose={closeModal}
                    >
                        <div className='deFLex'>
                            <button onClick={closeModal}><FontAwesomeIcon icon={faArrowLeft} /></button>
                            <button className='deleteToCart'>Reservar Turno</button>
                        </div>
                        <div className="modal-content-cart">


                            <div className="modal-send-form">
                                {selectedHorario && (
                                    <div className='deFLexRadio'>
                                        <p>Servicio: {servicio}</p>
                                        {/* <p>Día: {dayjs(selectedHorario?.date)?.format('dddd')}</p> */}
                                        <p>Fecha: {dayjs(selectedHorario?.date)?.format('dddd, D [de] MMMM [de] YYYY')}</p>
                                        <p>Horario: {selectedHorario?.horario?.horaInicio} - {selectedHorario?.horario?.horaFin}</p>
                                    </div>
                                )}
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder='Apellido y Nombre (*)'
                                />
                                <input
                                    type="number"
                                    id="dni"
                                    name="dni"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    placeholder='DNI - Identificacion (*)'
                                />
                                <input
                                    type="number"
                                    id="telefono"
                                    name="telefono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder='Telefono / WathsApp (*)'
                                />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Correo electronico (*)'
                                />
                                <select
                                    id="pago"
                                    name="pago"
                                    onChange={(e) => setPago(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Selecciona un método de pago (*)</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                    <option value="Billetera Virtual">Billetera Virtual</option>
                                </select>
                                {mensaje ? (
                                    <button type='button' className='btn' disabled>
                                        {mensaje}
                                    </button>
                                ) : (
                                    <button type='button' onClick={crearTurno} className='btn'>
                                        Finalizar
                                    </button>
                                )}
                            </div>
                        </div>
                    </Modal>
                </div >
            ) : (
                <h4 className="textCenter">No se encontraron días para este servicio.</h4>
            )}
        </div >
    );
}
