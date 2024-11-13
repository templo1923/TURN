import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es'; // Importar el locale de español
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Importar el estilo
import baseURL from '../../url';
import Modal from 'react-modal';
import './TurnosData.css'
import Swal from 'sweetalert2';
// Configurar moment.js para usar el idioma español
moment.locale('es'); // Establecer el idioma a español
const localizer = momentLocalizer(moment);

// Mensajes en español para las vistas
const messages = {
    today: 'Hoy',
    previous: 'Anterior',
    next: 'Siguiente',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
};

export default function TurnosData() {
    const [turnos, setTurnos] = useState([]);
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null); // Estado para el turno seleccionado
    const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para abrir o cerrar el modal
    const [nuevoEstado, setNuevoEstado] = useState('');
    useEffect(() => {
        cargarTurnos();
    }, []);

    const cargarTurnos = () => {
        fetch(`${baseURL}/turnoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                // Parsear los días que vienen como string JSON
                const turnosConDias = data.turnos?.map(turno => ({
                    ...turno,
                    dias: JSON.parse(turno.dias) // Convertir la cadena JSON en un objeto
                })) || [];
                setTurnos(turnosConDias);
            })
            .catch(error => console.error('Error al cargar turnos:', error));
    };

    const handleSelectEvent = (event) => {
        // Filtrar el turno seleccionado por su idTurno
        const turnoSeleccionado = turnos.find(item => item.idTurno === event.idTurno);

        if (turnoSeleccionado) {
            setTurnoSeleccionado(turnoSeleccionado); // Establecer el turno seleccionado
            setModalIsOpen(true); // Abrir el modal
        }
    };

    const handleCloseModal = () => {
        setModalIsOpen(false); // Cerrar el modal
    };

    const handleSelectSlot = (slotInfo) => {
        // Mostrar un mensaje cuando se selecciona un rango de fechas
        alert(`Seleccionado el rango: ${slotInfo.start} - ${slotInfo.end}`);
    };

    const events = turnos?.map(item => {
        const dias = item.dias ?? [];
        return dias?.map(dia => {
            // Determina el color según el estado del turno
            const bgColor = item.estado === "Pendiente" ? "#0c71cf"
                : item.estado === "Finalizado" ? "#008000"
                    : item.estado === "Rechazado" ? "#FF0000"
                        : "gray"; // Color predeterminado

            return {
                title: `${item.nombre} (${dia.horaInicio} - ${dia.horaFin})`,
                start: new Date(dia.dia + 'T' + dia.horaInicio),
                end: new Date(dia.dia + 'T' + dia.horaFin),
                allDay: false,
                idTurno: item.idTurno,
                estado: item.estado,
                style: { backgroundColor: bgColor, color: 'white' } // Aplica el color de fondo y texto blanco
            };
        });
    }).flat() ?? [];
    useEffect(() => {
        // Actualiza el valor del select cuando cambia el estado nuevoEstado

        setNuevoEstado(turnoSeleccionado?.estado)

    }, [turnoSeleccionado]);

    const handleUpdateText = async (idTurno) => {
        const payload = {

            idTurno: idTurno,
            estado: nuevoEstado !== '' ? nuevoEstado : turnoSeleccionado.estado,
        };

        fetch(`${baseURL}/turnoPut.php?idTurno=${idTurno}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {

                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                } else {

                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarTurnos();
                    handleCloseModal()
                }
            })
            .catch(error => {
                console.log(error.message);
                Swal.fire(
                    'Error!',
                    error.message,
                    'error'
                );
            });
    };

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                views={['month', 'week', 'day']}
                defaultView="month"
                style={{ height: 500 }}
                messages={messages}
                eventPropGetter={(event) => ({
                    style: event.style // Usa el estilo definido en el evento
                })}
            />
            {/* Modal para mostrar los detalles del turno seleccionado */}
            {turnoSeleccionado && (
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={handleCloseModal}
                    contentLabel="Detalle del Turno"
                    ariaHideApp={false} // Esto es necesario para que funcione el modal
                    className="modal-admin"
                    overlayClassName="overlay-admin"
                >
                    <div className='deFlexBtnsModal'>

                        <div className='deFlexBtnsModal'>
                            <button
                                className='selected'

                            >
                                Detalles del Turno
                            </button>
                        </div>
                        <span className="close" onClick={handleCloseModal}>
                            &times;
                        </span>
                    </div>
                    <div className='flexGrap'>
                        <fieldset>
                            <legend>Nombre </legend>
                            <input disabled value={turnoSeleccionado.nombre} />
                        </fieldset>
                        <fieldset>
                            <legend>DNI </legend>
                            <input disabled value={turnoSeleccionado.dni} />
                        </fieldset>
                        <fieldset>
                            <legend>Email </legend>
                            <input disabled value={turnoSeleccionado.email} />
                        </fieldset>
                        <fieldset>
                            <legend>Teléfono </legend>
                            <input disabled value={turnoSeleccionado.telefono} />
                        </fieldset>
                        <fieldset>
                            <legend>Estado (*)</legend>
                            <select
                                value={nuevoEstado !== '' ? nuevoEstado : turnoSeleccionado.estado}
                                onChange={(e) => setNuevoEstado(e.target.value)}
                            >
                                <option value={turnoSeleccionado.estado}>{turnoSeleccionado.estado}</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Rechazado">Rechazado</option>
                            </select>
                        </fieldset>

                        <fieldset>
                            <legend>Fecha y hora </legend>
                            <input disabled value={`${turnoSeleccionado.dias[0]?.dia} -  ${turnoSeleccionado.dias[0]?.horaInicio} -  ${turnoSeleccionado.dias[0]?.horaFin}`} />
                        </fieldset>
                    </div>

                    <button className='btnPost' onClick={() => handleUpdateText(turnoSeleccionado.idTurno)} >Guardar </button>

                </Modal>
            )}
        </div>
    );
}
