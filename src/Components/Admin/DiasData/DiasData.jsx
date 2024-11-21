import React, { useState, useEffect } from 'react';
import './DiasData.css';
import baseURL from '../../url';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function DiasData() {
    const [dias, setDias] = useState(null);
    const [loading, setLoading] = useState(true);
    const { idServicio } = useParams();
    const navigate = useNavigate();
    const diasSemana = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

    useEffect(() => {
        cargarDias();
    }, []);

    const cargarDias = () => {
        fetch(`${baseURL}/diasGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                const parsedDias = data?.dias_horarios?.map(item => ({
                    ...item,
                    dias: JSON.parse(item.dias)
                }));
                const diasFilt = parsedDias.find(d => d.idServicio === parseInt(idServicio));

                if (diasFilt) {
                    const diasExistentes = diasFilt.dias.map(d => d.dia);
                    const diasCompletos = diasSemana.map(dia => {
                        const diaEncontrado = diasFilt.dias.find(d => d.dia === dia);
                        return diaEncontrado ? { ...diaEncontrado, selected: true } : { dia, horarios: [], selected: false };
                    });
                    setDias({ ...diasFilt, dias: diasCompletos });
                } else {
                    setDias(null);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar días:', error);
                setLoading(true);
            });
    };

    const agregarHorarioAcorde = (diaNombre) => {
        const nuevosDias = { ...dias };
        const diaSeleccionado = nuevosDias.dias.find(d => d.dia === diaNombre);

        if (diaSeleccionado) {
            const ultimoHorario = diaSeleccionado.horarios[diaSeleccionado.horarios.length - 1];

            let nuevaHoraInicio = '09:00'; // Valor predeterminado para el primer horario
            let nuevaHoraFin = '09:30';    // Valor predeterminado para el primer horario

            if (ultimoHorario) {
                // Extrae y calcula el nuevo horario basado en el último horario
                const [horaFinHoras, horaFinMinutos] = ultimoHorario.horaFin.split(':').map(Number);
                const nuevaHoraInicioDate = new Date();
                nuevaHoraInicioDate.setHours(horaFinHoras, horaFinMinutos);

                const nuevaHoraFinDate = new Date(nuevaHoraInicioDate);
                nuevaHoraFinDate.setMinutes(nuevaHoraInicioDate.getMinutes() + 30); // Incrementa 30 minutos

                nuevaHoraInicio = nuevaHoraInicioDate.toTimeString().slice(0, 5);
                nuevaHoraFin = nuevaHoraFinDate.toTimeString().slice(0, 5);
            }

            const nuevoHorario = {
                horaInicio: nuevaHoraInicio,
                horaFin: nuevaHoraFin,
            };

            diaSeleccionado.horarios.push(nuevoHorario);
            diaSeleccionado.selected = true;
            setDias(nuevosDias);
        }
    };


    const replicarHorarios = (diaNombre) => {
        const diaSeleccionado = dias.dias.find(d => d.dia === diaNombre);
        if (!diaSeleccionado || diaSeleccionado.horarios.length === 0) {
            toast.error(`No hay horarios para replicar desde ${diaNombre}.`, { autoClose: 500 });
            return;
        }

        const nuevosDias = { ...dias };
        dias.dias.forEach(dia => {
            if (dia.dia !== diaNombre && dia.selected) {
                dia.horarios = [...diaSeleccionado.horarios];
            }
        });

        setDias(nuevosDias);
        toast.success(`Horarios replicados desde ${diaNombre}.`, { autoClose: 500 });
    };

    const handleHorarioChange = (diaNombre, horarioIndex, field, value) => {
        const nuevosDias = { ...dias };
        const diaSeleccionado = nuevosDias.dias.find(d => d.dia === diaNombre);

        if (diaSeleccionado) {
            diaSeleccionado.horarios[horarioIndex][field] = value;
            setDias(nuevosDias);
        }
    };

    const eliminarHorario = (diaNombre, horarioIndex) => {
        const nuevosDias = { ...dias };
        const diaSeleccionado = nuevosDias.dias.find(d => d.dia === diaNombre);

        if (diaSeleccionado) {
            diaSeleccionado.horarios = diaSeleccionado.horarios.filter((_, i) => i !== horarioIndex);
            setDias(nuevosDias);
        }
    };

    const handleCheckboxChange = (diaNombre) => {
        const nuevosDias = { ...dias };
        const diaSeleccionado = nuevosDias.dias.find(d => d.dia === diaNombre);

        if (diaSeleccionado) {
            diaSeleccionado.selected = !diaSeleccionado.selected;
            setDias(nuevosDias);
        }
    };
    const handleUpdate = async () => {
        // Validar que cada día seleccionado tenga al menos un horario
        for (const dia of dias.dias) {
            if (dia.selected && dia.horarios.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Debe agregar al menos un horario para el día ${dia.dia}`,
                });
                return;
            }
        }

        // Filtrar solo días con el checkbox activo
        const diasFiltrados = dias.dias.filter(dia => dia.selected);

        const payload = {
            dias: JSON.stringify(diasFiltrados),
        };

        fetch(`${baseURL}/diasPut.php?idDiasHorarios=${dias.idDiasHorarios}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire('Error!', data.error, 'error');
                } else {
                    Swal.fire('Editado!', data.mensaje, 'success');
                    cargarDias();
                    navigate('/dashboard/servicios');
                    window.location.reload();
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };
    const eliminar = (idDiasHorarios) => {
        // Reemplaza el window.confirm con SweetAlert2
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/diasDelete.php?idDiasHorarios=${idDiasHorarios}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        window.location.reload();
                        cargarDias();
                    })
                    .catch(error => {
                        console.error('Error al eliminar:', error);
                        toast.error(error);
                    });
            }
        });
    };
    return (
        <div className='DiasDataContainer'>
            {loading ? (
                <p>Cargando días...</p>
            ) : dias ? (
                <div className='NewContain'>
                    <div className="diasContainer">
                        {dias.dias.map(diaItem => (
                            <div key={diaItem.dia} className="diaGrp">
                                <div className='diaChek'>
                                    <input
                                        type="checkbox"
                                        checked={diaItem.selected || false}
                                        onChange={() => handleCheckboxChange(diaItem.dia)}
                                    />
                                    <span>{diaItem.dia.charAt(0).toUpperCase() + diaItem.dia.slice(1)}</span>
                                </div>

                                <div className="horarios">
                                    {diaItem.horarios.map((horario, index) => (
                                        <div key={index} className="horario">
                                            <input
                                                id='hora'
                                                type="time"
                                                value={horario.horaInicio}
                                                onChange={(e) => handleHorarioChange(diaItem.dia, index, 'horaInicio', e.target.value)}
                                            />
                                            <span>hasta</span>
                                            <input
                                                id='hora'
                                                type="time"
                                                value={horario.horaFin}
                                                onChange={(e) => handleHorarioChange(diaItem.dia, index, 'horaFin', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className='btnMenosHora'
                                                onClick={() => eliminarHorario(diaItem.dia, index)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className='btnMoreHora' onClick={() => agregarHorarioAcorde(diaItem.dia)}>
                                        Agregar
                                    </button>
                                    <button type="button" className='btnReplicar' onClick={() => replicarHorarios(diaItem.dia)}>
                                        Replicar
                                    </button>
                                </div>

                            </div>
                        ))}

                    </div>
                    <div className='deFlexBtnTienda'>
                        <button type="button" className='btnPost' onClick={handleUpdate}>
                            Guardar
                        </button>
                        <button className='eliminarBtn' onClick={() => eliminar(dias.idDiasHorarios)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
            ) : (
                <p>No se encontraron datos para este servicio.</p>
            )}
            <ToastContainer />
        </div>
    );
}
