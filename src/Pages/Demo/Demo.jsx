import React from 'react'
import Banners from '../../Components/Banners/Banners'
import './Demo.css'
import Footer from '../../Components/Footer/Footer'
import BtnWhatsapp from '../../Components/BtnWhatsapp/BtnWhatsapp'
import Developer from '../../Components/Developer/Developer'
export default function Demo() {
    return (
        <section className='demo'>
            <Banners />
            <Footer />
            <Developer />
            <BtnWhatsapp />
        </section>
    )
}
