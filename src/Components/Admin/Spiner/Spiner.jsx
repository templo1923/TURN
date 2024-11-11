import React from 'react';
import logo from '../../../images/spiner.png';
import './Spiner.css';

export default function Spiner() {
    return (
        <div className='spinnerContainer'>
            <div className='spinner'>
                <img src={logo} alt="Spinner" className='spinnerImage' />
                <p>Cargando...</p>
            </div>
        </div>
    );
}
