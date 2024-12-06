import React, { useState, useEffect } from 'react';
import './Main.css'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import UsuariosMain from '../../Components/Admin/UsuariosMain/UsuariosMain'
import CardsCantidad from '../../Components/Admin/CardsCantidad/CardsCantidad'
import InfoUserMain from '../../Components/Admin/InfoUserMain/InfoUserMain'
import Grafico1 from '../../Components/Admin/Graficos/Grafico1'
import Grafico2 from '../../Components/Admin/Graficos/Grafico2'
import { fetchUsuario, getUsuario } from '../../Components/user';
import ServiciosData from '../../Components/Admin/ServiciosData/ServiciosData'
import TurnosData from '../../Components/Admin/TurnosData/TurnosData'
export default function Main() {
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
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>
                <HeaderDash />

                {loading ? (
                    < ></>
                ) : usuarioLegued?.idUsuario ? (
                    <>
                        {usuarioLegued?.rol === 'admin' ? (
                            <>
                                <div className='containerMain'>
                                    <div className='deFLexMain'>
                                        <CardsCantidad />
                                        <UsuariosMain />
                                        <InfoUserMain />
                                    </div>
                                    <div className='graficosFlex'>
                                        <Grafico1 />
                                        <Grafico2 />
                                    </div>
                                </div>
                            </>
                        ) : usuarioLegued?.rol === 'colaborador' ? (
                            <>
                                <div className='container'>
                                    <TurnosData />
                                </div>
                                <div className='container'>
                                    <ServiciosData />
                                </div>
                            </>
                        ) : (
                            <div>

                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className='containerMain'>
                            <div className='deFLexMain'>
                                <CardsCantidad />
                                <UsuariosMain />
                                <InfoUserMain />
                            </div>
                            <div className='graficosFlex'>
                                <Grafico1 />
                                <Grafico2 />
                            </div>
                        </div>
                    </>
                )}
                <div>

                </div>
            </section>
        </div>
    )
}
