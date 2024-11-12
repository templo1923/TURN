import React from 'react'
import Banners from '../../Components/Banners/Banners'
import './Demo.css'
import Footer from '../../Components/Footer/Footer'
import BtnWhatsapp from '../../Components/BtnWhatsapp/BtnWhatsapp'
import Developer from '../../Components/Developer/Developer'
import Servicios from '../../Components/Servicios/Servicios'
export default function Demo() {
    return (
        <section className='demo'>
            <Banners />
            <Servicios />
            <Footer />
            <Developer />
            <BtnWhatsapp />
        </section>
    )
}
