import React, { useState, useEffect } from 'react';
import './GraficoPedidos.css';
import { Chart } from 'primereact/chart';
import baseURL from '../../url';

export default function GraficoServicios() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

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
                procesarDatosGrafico(data.turnos?.filter(filt => filt.estado === 'Finalizado'));
            })
            .catch(error => {
                console.error('Error al cargar turnos:', error);
                establecerDatosPorDefecto();
            });
    };

    const procesarDatosGrafico = (turnos) => {
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

        // Ordenar servicios por cantidad (de mayor a menor) y tomar los 6 más solicitados
        const serviciosOrdenados = Object.entries(contadorServicios)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6);

        const labels = serviciosOrdenados.map(([servicio]) => servicio);
        const data = serviciosOrdenados.map(([, cantidad]) => cantidad);

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Colores para el gráfico
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
        const labels = ['Servicio A', 'Servicio B', 'Servicio C'];
        const data = [5, 3, 8];

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Cantidad de turnos por servicio',
                    data: data,
                    backgroundColor: 'rgba(31, 135, 233, 0.455)',
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
            <h3 className="titleGrafico">Servicios más solicitados</h3>
            <div className="grafico-container-2">
                <Chart type="polarArea" data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
