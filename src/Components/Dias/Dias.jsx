import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './Dias.css';
import baseURL from '../url';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

SwiperCore.use([Navigation, Pagination, Autoplay]);

export default function Dias() {
    const { idServicio } = useParams();
    const [dias, setDias] = useState([]);
    const [dia, setDia] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);

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
        if (dias.length > 0) {
            const diasFilt = dias.find(d => d.idServicio === parseInt(idServicio));
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

        for (let date = startOfMonth; date.isBefore(endOfMonth); date = date.add(1, 'day')) {
            if (date.isSame(today, 'day') || date.isAfter(today)) {
                daysInMonth.push({
                    day: date.format('ddd').replace('.', '').toLowerCase(),
                    date: date.format('YYYY-MM-DD'),
                });
            }
        }
        return daysInMonth;
    };

    const handleDayClick = (monthDay, index) => {
        const selectedDayInfo = dia?.dias.find(d => d.dia === monthDay.day);
        setSelectedDay(selectedDayInfo ? { ...selectedDayInfo, date: monthDay.date } : null);
        setSelectedHorario(null);
        setSelectedDayIndex(index);
    };

    const handleHorarioClick = (horario, date) => {
        setSelectedHorario({ horario, date });
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className='Dias'>
            {dia ? (
                <div>
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        slidesPerView={'auto'}
                        id='cardsServicio'
                    >

                        {generateMonthDays().map((monthDay, index) => {
                            const matchingDayInfo = dia.dias.find(d => d.dia === monthDay.day);
                            const disponibilidadText = matchingDayInfo ? "Disponible" : "No disponible";

                            return (
                                <SwiperSlide
                                    key={index}
                                    onClick={() => handleDayClick(monthDay, index)}
                                    id={selectedDayIndex === index ? 'selectedDay' : 'cardDay'}
                                >
                                    {/* <h4>{monthDay.day}</h4> */}
                                    <h5>{dayjs(monthDay.date).format('dddd')}</h5>
                                    <h4>{dayjs(monthDay.date).format('D')}</h4>
                                    <h5>{dayjs(monthDay.date).format('MMMM')}</h5>
                                    <p>{disponibilidadText}</p>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                    <hr />
                    {selectedDay ? (
                        <div className='horariosSeleccionados'>
                            <h4>Horarios disponibles para {dayjs(selectedDay.date).format('dddd, D [de] MMMM [de] YYYY')}:</h4>
                            <div className="flexGrapHoras">
                                {selectedDay.horarios.map((horario, idx) => (
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
                        <p className="noHay">Selecciona un día para ver sus horarios.</p>
                    )}
                    <hr />
                    {selectedHorario && (
                        <div className='horarioSeleccionado'>
                            <h4>Horario seleccionado:</h4>
                            <p>Día: {dayjs(selectedHorario.date).format('dddd')}</p>
                            <p>Fecha: {dayjs(selectedHorario.date).format('dddd, D [de] MMMM [de] YYYY')}</p>
                            <p>Horario: {selectedHorario.horario.horaInicio} - {selectedHorario.horario.horaFin}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="noHay">No se encontraron días para este servicio.</div>
            )}
        </div>
    );
}
