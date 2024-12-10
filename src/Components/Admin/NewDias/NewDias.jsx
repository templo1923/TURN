import React, { useState, useEffect } from 'react';
import './NewDias.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import { fetchUsuario, getUsuario } from '../../user';
export default function NewDias() {
    const [mensaje, setMensaje] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [servicios, setServicios] = useState([]);
    const [idServicio, setidServicio] = useState('');
    const [diasSeleccionados, setDiasSeleccionados] = useState({
        lun: false,
        mar: false,
        mié: false,
        jue: false,
        vie: false,
        sáb: false,
        dom: false,
    });
    const [horarios, setHorarios] = useState({
        lun: [],
        mar: [],
        mié: [],
        jue: [],
        vie: [],
        sáb: [],
        dom: [],
    });

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    useEffect(() => {
        cargarServicios();
    }, []);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios || []);
            })
            .catch(error => console.error('Error al cargar servicios:', error));
    };

    const handleServicio = (e) => {
        setidServicio(e.target.value);
    };

    const handleDiaChange = (dia) => {
        setDiasSeleccionados({
            ...diasSeleccionados,
            [dia]: !diasSeleccionados[dia],
        });
    };

    const agregarHorario = (dia) => {
        const ultimoHorario = horarios[dia]?.[horarios[dia].length - 1];
        let nuevaHoraInicio = '09:00'; // Valor predeterminado para el primer horario
        let nuevaHoraFin = '09:30';    // Valor predeterminado para el primer horario

        if (ultimoHorario) {
            // Calcula el nuevo horario basado en el último horario
            const [horaFinHoras, horaFinMinutos] = ultimoHorario.horaFin.split(':').map(Number);
            const nuevaHoraInicioDate = new Date();
            nuevaHoraInicioDate.setHours(horaFinHoras, horaFinMinutos);

            const nuevaHoraFinDate = new Date(nuevaHoraInicioDate);
            nuevaHoraFinDate.setMinutes(nuevaHoraInicioDate.getMinutes() + 30); // Incrementa 1 hora

            nuevaHoraInicio = nuevaHoraInicioDate.toTimeString().slice(0, 5);
            nuevaHoraFin = nuevaHoraFinDate.toTimeString().slice(0, 5);
        }

        const nuevaHora = {
            horaInicio: nuevaHoraInicio,
            horaFin: nuevaHoraFin,
        };

        setHorarios({
            ...horarios,
            [dia]: [...horarios[dia], nuevaHora],
        });
    };
    const replicarHorarios = (dia) => {
        if (!dia || !horarios[dia] || horarios[dia].length === 0) {
            toast.error(`No hay horarios para replicar desde ${dia}.`, { autoClose: 500 });
            return;
        }

        const horariosAReplicar = horarios[dia];
        const nuevosHorarios = { ...horarios };

        Object.keys(diasSeleccionados).forEach((otroDia) => {
            if (otroDia !== dia && diasSeleccionados[otroDia]) {
                nuevosHorarios[otroDia] = [...horariosAReplicar];
            }
        });

        setHorarios(nuevosHorarios);
        toast.success(`Horarios replicados desde ${dia}.`, { autoClose: 500 });
    };

    const handleHorarioChange = (dia, index, field, value) => {
        const nuevaListaHorarios = [...horarios[dia]];
        nuevaListaHorarios[index][field] = value;
        setHorarios({
            ...horarios,
            [dia]: nuevaListaHorarios,
        });
    };

    const eliminarHorario = (dia, index) => {
        const nuevaListaHorarios = horarios[dia].filter((_, i) => i !== index);
        setHorarios({
            ...horarios,
            [dia]: nuevaListaHorarios,
        });
    };

    const crear = async () => {
        const form = document.getElementById("crearForm");
        const formData = new FormData(form);
        const diasHorarios = [];

        for (const dia in diasSeleccionados) {
            if (diasSeleccionados[dia]) {
                if (horarios[dia].length === 0) {
                    toast.error(`Debes agregar al menos un horario para ${dia}.`);
                    return;
                }
                diasHorarios.push({
                    dia,
                    horarios: horarios[dia],
                });
            }
        }

        formData.append('dias', JSON.stringify(diasHorarios));
        formData.append('estado', 'Activo');
        try {
            const response = await fetch(`${baseURL}/diasPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log(diasHorarios)
            console.log(idServicio)
            if (data.mensaje) {
                toast.success(data.mensaje);
                window.location.reload();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error al crear:', error);
            toast.error('Error de conexión. Inténtelo de nuevo.');
        }
    };
    //Trae usuario logueado-----------------------------
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario();
            setLoading(false);
        };

        fetchData();
    }, []);
    const usuarioLegued = getUsuario();
    return (
        <div className='NewContain' id='NewDias'>
            <ToastContainer />
            <button onClick={toggleModal} className='btnSave'>
                <span>+</span>  Dias
            </button>
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Dias</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>

                        <form id="crearForm">
                            <fieldset>
                                <legend>Servicio (*)</legend>
                                <select
                                    id="idServicio"
                                    name="idServicio"
                                    value={idServicio}
                                    onChange={handleServicio}
                                >
                                    <option value="">Selecciona opción</option>
                                    {loading ? (
                                        <></>
                                    ) : usuarioLegued?.idUsuario ? (
                                        <>
                                            {usuarioLegued?.rol === 'admin' ? (
                                                <>
                                                    {
                                                        servicios?.filter(item => usuarioLegued.rol === 'admin' || item.idUsuario === usuarioLegued.idUsuario)?.map(item => (
                                                            <option value={item.idServicio} key={item.idServicio}>
                                                                {item.titulo}
                                                            </option>
                                                        ))
                                                    }
                                                </>
                                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                                <>
                                                    {
                                                        servicios?.filter(item => usuarioLegued.rol === 'admin' || item.idUsuario === usuarioLegued.idUsuario)?.map(item => (
                                                            <option value={item.idServicio} key={item.idServicio}>
                                                                {item.titulo}
                                                            </option>
                                                        ))
                                                    }
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {
                                                servicios?.map(item => (
                                                    <option value={item.idServicio} key={item.idServicio}>
                                                        {item.titulo}
                                                    </option>
                                                ))
                                            }
                                        </>
                                    )}

                                </select>
                            </fieldset>

                            <legend>Seleccionar días y horarios</legend>
                            <div className="diasContainer">
                                {Object.keys(diasSeleccionados).map(dia => (
                                    <div key={dia} className="diaGrp">
                                        <div className='diaChek'>
                                            <input
                                                type="checkbox"
                                                checked={diasSeleccionados[dia]}
                                                onChange={() => handleDiaChange(dia)}
                                            />
                                            <span> {dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                                        </div>

                                        {diasSeleccionados[dia] && (
                                            <div className="horarios">
                                                {horarios[dia].map((horario, index) => (
                                                    <div key={index} className="horario">
                                                        <input
                                                            id='hora'
                                                            type="time"
                                                            value={horario.horaInicio}
                                                            onChange={(e) => handleHorarioChange(dia, index, 'horaInicio', e.target.value)}
                                                        />
                                                        <span>hasta</span>
                                                        <input
                                                            id='hora'
                                                            type="time"
                                                            value={horario.horaFin}
                                                            onChange={(e) => handleHorarioChange(dia, index, 'horaFin', e.target.value)}
                                                        />
                                                        <button type="button" className='btnMenosHora' onClick={() => eliminarHorario(dia, index)}>Eliminar</button>
                                                    </div>
                                                ))}
                                                <button type="button" className='btnMoreHora' onClick={() => agregarHorario(dia)}>Agregar</button>
                                                <button type="button" className='btnReplicar' onClick={() => replicarHorarios(dia)}>Replicar</button>
                                            </div>

                                        )}
                                    </div>
                                ))}
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
