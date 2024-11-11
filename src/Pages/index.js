import IndexLayout from "../Layouts/IndexLayout";
import MainLayout from "../Layouts/MainLayout";
import PagesLayaut from '../Layouts/PagesLayaut'
import { createBrowserRouter } from "react-router-dom";
import Usuarios from '../Pages/Usuarios/Usuarios'
import Banners from "./Banners/Banners";
import Main from "./Main/Main";
import Categorias from "./Categorias/Categorias";
import PageDetail from '../Pages/PageDetail/PageDetail';
import Tienda from "./Tienda/Tienda";
import Turnos from './Turnos/Turnos'
import Servicios from './Servicios/Servicios'
export const router = createBrowserRouter([

    {
        path: "/",
        element: <IndexLayout />,

    },
    {
        path: "/",
        element: <PagesLayaut />,
        children: [
            {
                path: `/servicio/:idServicio/:servicio`,
                element: <PageDetail />,
            },


        ]
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: `/dashboard`,
                element: <Main />,
            },

            {
                path: `/dashboard/usuarios`,
                element: <Usuarios />,
            },
            {
                path: `/dashboard/banners`,
                element: <Banners />,
            },

            {
                path: `/dashboard/categorias`,
                element: <Categorias />,
            },

            {
                path: `/dashboard/servicios`,
                element: <Servicios />,
            },
            {
                path: `/dashboard/turnos`,
                element: <Turnos />,
            },

            {
                path: `/dashboard/contacto`,
                element: <Tienda />,
            },

        ],
    },


]);
