import React, { useEffect, useState, useRef } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../url';
import './Banners.css';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import moneda from '../moneda';
import { Link as Anchor } from "react-router-dom";

SwiperCore.use([Navigation, Pagination, Autoplay]);

export default function Banners() {
    const [images, setImages] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const swiperRef = useRef(null);

    useEffect(() => {
        cargarBanners();
        cargarServicios();
    }, []);

    const cargarServicios = () => {
        fetch(`${baseURL}/serviciosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setServicios(data.servicios.reverse().slice(0, 2));
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar servicios:', error);
                setLoading(false);
            });
    };

    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                const bannerImages = data.banner.map(banner => banner.imagen);
                setImages(bannerImages);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar banners:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (swiperRef.current) {
            swiperRef.current?.update();
        }
    }, [images, servicios]);

    const obtenerImagen = (item) => {
        return item.imagen1 || null;
    };

    const combinedSlides = [];
    const maxLength = Math.max(images.length, servicios.length);

    if (servicios.length > 0) {
        for (let i = 0; i < maxLength; i++) {
            if (i < images.length) {
                combinedSlides.push({ type: 'banner', content: images[i] });
            }
            if (i < servicios.length) {
                combinedSlides.push({ type: 'service', content: servicios[i] });
            }
        }
    } else {
        images.forEach((image) => {
            combinedSlides.push({ type: 'banner', content: image });
        });
    }

    return (
        <div className='BannerContain'>
            {loading ? (
                <div className='loadingBanner'>
                    {/* Loading spinner or message */}
                </div>
            ) : (
                <Swiper
                    effect={'coverflow'}
                    grabCursor={true}
                    loop={true}
                    slidesPerView={'auto'}
                    coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
                    navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
                    autoplay={{ delay: 3000 }}
                    pagination={{ clickable: true }}
                    onSwiper={(swiper) => {
                        console.log(swiper);
                        swiperRef.current = swiper;
                    }}
                    id='swiper_container'
                >
                    {combinedSlides.map((slide, index) => (
                        <SwiperSlide id='SwiperSlide-scroll' key={index}>
                            {slide.type === 'banner' ? (
                                <img src={slide.content} alt={`banner-${index}`} />
                            ) : (
                                <div className='service-slide'>
                                    <img src={obtenerImagen(slide.content)} alt={`servicio-${index}`} />
                                    <div className='service-slide-text'>
                                        <h3>{slide?.content?.titulo}</h3>
                                        <h5>{moneda} {String(slide.content?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                        <Anchor to={`/servicio/${slide?.content?.idServicio}/${slide?.content?.titulo?.replace(/\s+/g, '-')}`}>
                                            Ver Servicio
                                        </Anchor>
                                    </div>
                                </div>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
}
