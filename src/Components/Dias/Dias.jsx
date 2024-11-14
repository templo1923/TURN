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

    const [isFocused, setIsFocused] = useState(false);
    useEffect(() => {
        cargarDias();
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

    useEffect(() => {
        if (dias?.length > 0) {
            const diasFilt = dias?.find(d => d.idServicio === parseInt(idServicio));
            if (diasFilt) {
                const parsedDias = JSON.parse(diasFilt.dias);
                setDia({ ...diasFilt, dias: parsedDias });
            } else {
                setDia(null);
            }
        }
    }, [idServicio, dias]);

    const generateMonthDays = () => {
        const daysInMonth = [];
        const startOfMonth = dayjs().startOf('month');
        const endOfMonth = dayjs().endOf('month');
        const today = dayjs();

        for (let date = startOfMonth; date?.isBefore(endOfMonth); date = date.add(1, 'day')) {
            if (date?.isSame(today, 'day') || date?.isAfter(today)) {
                daysInMonth?.push({
                    day: date.format('ddd').replace('.', '').toLowerCase(),
                    date: date.format('YYYY-MM-DD'),
                });
            }
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
            formData.append('estado', 'Pendiente');
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

                // Guardar el idTurno en localStorage
                localStorage.setItem('idTurno', data.idTurno);
                // Limpiar campos y cerrar modal
                setNombre('');
                setDni('');
                setTelefono('');
                setEmail('');
                setMensaje('');
                closeModal();
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
        return <div>Cargando...</div>;
    }

    return (
        <div className='Dias'>
            {dia ? (
                <div>
                    <hr />
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        slidesPerView={'auto'}
                        id='cardsServicio'
                    >

                        {generateMonthDays().map((monthDay, index) => {
                            const matchingDayInfo = dia?.dias?.find(d => d.dia === monthDay?.day);
                            const disponibilidadText = matchingDayInfo ? <div className="green"></div> : <div className="red"></div>;

                            return (
                                <SwiperSlide
                                    key={index}
                                    onClick={() => handleDayClick(monthDay, index)}
                                    id={selectedDayIndex === index ? 'selectedDay' : 'cardDay'}
                                >
                                    {/* <h4>{monthDay.day}</h4> */}
                                    <h5>{dayjs(monthDay.date)?.format('dddd')}</h5>
                                    <h4>{dayjs(monthDay.date)?.format('D')}</h4>
                                    <h5>{dayjs(monthDay.date)?.format('MMMM')}</h5>
                                    {disponibilidadText}
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                    <hr />
                    {selectedDay ? (
                        <div className='horariosSeleccionados'>
                            <h4>Horarios disponibles para {dayjs(selectedDay?.date)?.format('dddd, D [de] MMMM [de] YYYY')}:</h4>
                            <div className="flexGrapHoras">
                                {selectedDay?.horarios?.map((horario, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleHorarioClick(horario, selectedDay.date)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {horario.horaInicio} - {horario.horaFin}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <h4 className="textCenter">Selecciona un día para ver sus horarios.</h4>
                    )}
                    <hr />


                    {selectedHorario && (
                        <button className="btnFlotant" onClick={openModal} >Agendar turno</button>
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
                                        <p>Día: {dayjs(selectedHorario?.date)?.format('dddd')}</p>
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
