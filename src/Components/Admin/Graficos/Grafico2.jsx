import React, { useState, useEffect } from 'react';
import './Grafico.css';
import { Chart } from 'primereact/chart';
import baseURL from '../../url';
import { Link as Anchor } from "react-router-dom";
export default function Grafico2() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [servicios, setServicios] = useState([]); // Lista de servicios
    const [servicioSeleccionado, setServicioSeleccionado] = useState(''); // Servicio seleccionado

    useEffect(() => {
        cargarTurnos();
    }, []);

    const cargarTurnos = () => {
        fetch(`${baseURL}/turnoGet.php`, {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la conexión');
                }
                return response.json();
            })
            .then(data => {
                const turnos = data.turnos || [];
                if (turnos.length === 0) {
                    establecerDatosPorDefecto();
                } else {
                    const serviciosUnicos = [...new Set(turnos.map(turno => turno.servicio))];
                    setServicios(serviciosUnicos);
                    procesarDatosGrafico(turnos);
                }
            })
            .catch(error => {
                console.error('Error al cargar turnos:', error);
                establecerDatosPorDefecto();
            });
    };

    const procesarDatosGrafico = (turnos) => {
        if (turnos.length === 0) {
            establecerDatosPorDefecto();
            return;
        }

        const contadorServicios = {};

        // Agrupar turnos por servicio y contar su frecuencia
        turnos.forEach(turno => {
            const servicio = turno.servicio;
            if (contadorServicios[servicio]) {
                contadorServicios[servicio] += 1;
            } else {
                contadorServicios[servicio] = 1;
            }
        });

        const serviciosOrdenados = Object.entries(contadorServicios)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6);

        const labels = serviciosOrdenados.map(([servicio]) => servicio);
        const data = serviciosOrdenados.map(([, cantidad]) => cantidad);

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        const backgroundColors = generateColorShades('#0c71cf', labels.length);

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Cantidad de turnos por servicio',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#0c71cf',
                    borderWidth: 1,
                },
            ],
        });

        setChartOptions({
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: surfaceBorder,
                    },
                },
            },
        });
    };

    const procesarTurnosPorEstado = (turnos) => {
        if (turnos.length === 0) {
            establecerDatosPorDefecto();
            return;
        }

        const estados = ['Pendiente', 'Finalizado', 'Cancelado'];
        const contadorPorEstado = estados.reduce((acc, estado) => {
            acc[estado] = turnos.filter(turno => turno.estado === estado).length;
            return acc;
        }, {});

        setChartData({
            labels: estados,
            datasets: [
                {
                    label: `Turnos del servicio: ${servicioSeleccionado}`,
                    data: estados.map(estado => contadorPorEstado[estado]),
                    backgroundColor: ['#0c71cf', '#008000', '#FF6384'],
                },
            ],
        });
    };

    const handleServicioChange = (e) => {
        const servicio = e.target.value;
        setServicioSeleccionado(servicio);

        if (servicio === '') {
            cargarTurnos();
        } else {
            fetch(`${baseURL}/turnoGet.php`, {
                method: 'GET',
            })
                .then(response => response.json())
                .then(data => {
                    const turnosServicio = data.turnos?.filter(turno => turno.servicio === servicio) || [];
                    procesarTurnosPorEstado(turnosServicio);
                })
                .catch(error => {
                    console.error('Error al cargar turnos del servicio:', error);
                    establecerDatosPorDefecto();
                });
        }
    };

    const generateColorShades = (baseColor, count) => {
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);

        const shades = [];
        for (let i = 0; i < count; i++) {
            const alpha = 0.7 - i * 0.1;
            shades.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
        }
        return shades;
    };

    const establecerDatosPorDefecto = () => {
        const labels = ['Ejemplo A', 'Ejemplo B', 'Ejemplo C'];
        const data = [5, 3, 8];

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Datos de ejemplo',
                    data: data,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    borderColor: '#0c71cf',
                },
            ],
        });

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        setChartOptions({
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        });
    };

    return (
        <div className="GraficoContent">
            <div className='deFlexMore'>
                <h3>Turnos agendados</h3>
                <Anchor to={`/dashboard/turnos`} className='logo'>
                    Ver más
                </Anchor>
            </div>
            <select id="servicioSelect" onChange={handleServicioChange} value={servicioSeleccionado}>
                <option value="">Todos</option>
                {servicios.map((servicio, index) => (
                    <option key={index} value={servicio}>
                        {servicio}
                    </option>
                ))}
            </select>
            <div className="grafico-container-2">
                <Chart type="polarArea" data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
