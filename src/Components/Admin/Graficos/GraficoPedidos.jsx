import React, { useState, useEffect } from 'react';
import './GraficoPedidos.css';
import { Chart } from 'primereact/chart';
import baseURL from '../../url';

export default function GraficoTurnos() {
    const [chartDataDia, setChartDataDia] = useState({});
    const [chartDataSemana, setChartDataSemana] = useState({});
    const [chartDataMes, setChartDataMes] = useState({});
    const [totalDia, setTotalDia] = useState(0);
    const [totalSemana, setTotalSemana] = useState(0);
    const [totalMes, setTotalMes] = useState(0);
    const [activeChart, setActiveChart] = useState('dia');

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
                const turnos = data.turnos?.filter(filt => filt.estado === 'Finalizado');
                procesarDatos(turnos);
            })
            .catch(error => {
                console.error('Error al cargar turnos:', error);
            });
    };

    const procesarDatos = (turnos) => {
        if (turnos.length === 0) {
            console.warn('No hay turnos disponibles');
            return;
        }

        calcularTotalesPorDia(turnos);
        calcularTotalesPorSemana(turnos);
        calcularTotalesPorMes(turnos);
    };

    const calcularTotalesPorDia = (turnos) => {
        const totalesPorDia = {};

        turnos.forEach(turno => {
            const dias = JSON.parse(turno.dias); // Parsear el campo `dias`
            dias.forEach(d => {
                const fecha = d.dia; // Formato YYYY-MM-DD
                if (!totalesPorDia[fecha]) {
                    totalesPorDia[fecha] = 0;
                }
                totalesPorDia[fecha] += 1; // Contar el turno
            });
        });

        const fechasOrdenadas = Object.keys(totalesPorDia).sort((a, b) => new Date(a) - new Date(b));
        const datos = fechasOrdenadas.map(fecha => totalesPorDia[fecha]);

        setTotalDia(datos.reduce((acc, val) => acc + val, 0));
        generarGrafico(fechasOrdenadas, datos, 'Turnos por Día', setChartDataDia);
    };

    const calcularTotalesPorSemana = (turnos) => {
        const totalesPorSemana = {};

        turnos.forEach(turno => {
            const dias = JSON.parse(turno.dias);
            dias.forEach(d => {
                const fecha = new Date(d.dia);
                const semana = getNumeroSemana(fecha);
                if (!totalesPorSemana[semana]) {
                    totalesPorSemana[semana] = 0;
                }
                totalesPorSemana[semana] += 1;
            });
        });

        const semanasOrdenadas = Object.keys(totalesPorSemana).sort((a, b) => a - b);
        const datos = semanasOrdenadas.map(semana => totalesPorSemana[semana]);

        setTotalSemana(datos.reduce((acc, val) => acc + val, 0));
        generarGrafico(semanasOrdenadas.map(s => `Semana ${s}`), datos, 'Turnos por Semana', setChartDataSemana);
    };

    const calcularTotalesPorMes = (turnos) => {
        const totalesPorMes = {};

        turnos.forEach(turno => {
            const dias = JSON.parse(turno.dias);
            dias.forEach(d => {
                const fecha = new Date(d.dia);
                const mes = fecha.toLocaleString('default', { month: 'long' });
                if (!totalesPorMes[mes]) {
                    totalesPorMes[mes] = 0;
                }
                totalesPorMes[mes] += 1;
            });
        });

        const mesesOrdenados = Object.keys(totalesPorMes);
        const datos = mesesOrdenados.map(mes => totalesPorMes[mes]);

        setTotalMes(datos.reduce((acc, val) => acc + val, 0));
        generarGrafico(mesesOrdenados, datos, 'Turnos por Mes', setChartDataMes);
    };

    const getNumeroSemana = (fecha) => {
        const primeraFechaAño = new Date(fecha.getFullYear(), 0, 1);
        const diasDesdePrimeroEnero = Math.floor((fecha - primeraFechaAño) / (24 * 60 * 60 * 1000));
        return Math.ceil((diasDesdePrimeroEnero + primeraFechaAño.getDay() + 1) / 7);
    };

    const generarGrafico = (labels, data, labelGrafico, setChartData) => {
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: labelGrafico,
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(31, 135, 233, 0.455)',
                    borderColor: '#0c71cf',
                    tension: 0.4
                }
            ]
        };
        setChartData(chartData);
    };

    const manejarCambioGrafico = (tipoGrafico) => {
        setActiveChart(tipoGrafico);
    };

    return (
        <div className="GraficoContent">
            <h3 className='titleGrafico'>Turnos Finalizados</h3>
            <div className="botones-grafico">
                <button
                    className={activeChart === 'dia' ? 'activeBtnGraf' : 'desactiveBtn'}
                    onClick={() => manejarCambioGrafico('dia')}
                >
                    Día
                </button>
                <button
                    className={activeChart === 'semana' ? 'activeBtnGraf' : 'desactiveBtn'}
                    onClick={() => manejarCambioGrafico('semana')}
                >
                    Semana
                </button>
                <button
                    className={activeChart === 'mes' ? 'activeBtnGraf' : 'desactiveBtn'}
                    onClick={() => manejarCambioGrafico('mes')}
                >
                    Mes
                </button>
            </div>
            <div className="grafico-container">
                {activeChart === 'dia' && <Chart type="line" data={chartDataDia} />}
                {activeChart === 'semana' && <Chart type="line" data={chartDataSemana} />}
                {activeChart === 'mes' && <Chart type="line" data={chartDataMes} />}
            </div>
        </div>
    );
}
