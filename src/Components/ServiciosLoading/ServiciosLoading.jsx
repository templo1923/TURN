import React from 'react'
import './ServiciosLoading.css'
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
SwiperCore.use([Navigation, Pagination, Autoplay]);
export default function ServiciosLoading() {
    return (
        <div>

            <Swiper
                effect={'coverflow'}
                grabCursor={true}
                slidesPerView={'auto'}
                id="cardsServicio"
            >
                <SwiperSlide id="butonLoading">

                </SwiperSlide>
                <SwiperSlide id="butonLoading">

                </SwiperSlide>
                <SwiperSlide id="butonLoading">

                </SwiperSlide>

                <SwiperSlide id="butonLoading">

                </SwiperSlide>
                <SwiperSlide id="butonLoading">

                </SwiperSlide>
                <SwiperSlide id="butonLoading">

                </SwiperSlide>
                <SwiperSlide id="butonLoading">

                </SwiperSlide>
                <SwiperSlide id="butonLoading">

                </SwiperSlide>

                <SwiperSlide id="butonLoading">

                </SwiperSlide>
                <SwiperSlide id="butonLoading">

                </SwiperSlide>
            </Swiper>
            <Swiper
                effect={'coverflow'}
                grabCursor={true}
                slidesPerView={'auto'}
                id="cardsServicio"
            >
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>

                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>

            </Swiper>
            <Swiper
                effect={'coverflow'}
                grabCursor={true}
                slidesPerView={'auto'}
                id="cardsServicio"
            >
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>

                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>
                <SwiperSlide id="cardServicioLoading">

                </SwiperSlide>

            </Swiper>
        </div>
    )
}
