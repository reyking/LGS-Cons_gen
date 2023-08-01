-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 31-07-2023 a las 16:01:47
-- Versión del servidor: 10.3.39-MariaDB-0+deb10u1
-- Versión de PHP: 7.3.31-1~deb10u4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `Consultorias`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Empresas`
--

CREATE TABLE `Empresas` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Empresas`
--

INSERT INTO `Empresas` (`Id`, `Nombre`) VALUES
(1, 'Megamedia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Historias`
--

CREATE TABLE `Historias` (
  `Id` int(11) NOT NULL,
  `Empresa_id` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Descripcion` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Historias`
--

INSERT INTO `Historias` (`Id`, `Empresa_id`, `Nombre`, `Descripcion`) VALUES
(1, 1, 'Integracion de IDP para su uso con usuarios de vtr', 'Integracion de IDP para su uso con usuarios de vtr:\r\n- Definicion de uso de api externa\r\n- Defincion de enpoints\r\n- Implementacion de endpoints\r\n- Validar implementacion junto\r\n- Test unitarios de endpoints desarrollados');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Personas`
--

CREATE TABLE `Personas` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Nombre_corto` varchar(6) DEFAULT NULL,
  `Empresa_id` int(11) NOT NULL,
  `Correo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Personas`
--

INSERT INTO `Personas` (`Id`, `Nombre`, `Nombre_corto`, `Empresa_id`, `Correo`) VALUES
(1, 'Marco Farias', 'M.F.', 1, NULL),
(2, 'Erik Queirolo', 'E.Q.', 1, NULL),
(3, 'Luiz Quelvez', 'L.Q.', 1, NULL),
(4, 'Pablo Ramirez', 'P.R.', 1, NULL),
(5, 'Victor Vilches', 'V.V.', 1, NULL),
(6, 'Ramon Parra', 'R.P.', 1, NULL),
(7, 'Francesco Donato', 'F.D.', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Personas_trabajo`
--

CREATE TABLE `Personas_trabajo` (
  `Id` int(11) NOT NULL,
  `Persona_id` int(11) NOT NULL,
  `Trabajo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Personas_trabajo`
--

INSERT INTO `Personas_trabajo` (`Id`, `Persona_id`, `Trabajo_id`) VALUES
(1, 1, 11),
(2, 3, 11),
(5, 4, 3),
(6, 4, 5),
(7, 1, 6),
(8, 3, 6),
(9, 2, 6),
(10, 1, 7),
(11, 3, 7),
(12, 1, 8),
(13, 3, 8),
(14, 2, 8),
(15, 1, 14),
(16, 1, 15),
(17, 3, 15),
(18, 4, 15),
(19, 7, 15),
(20, 3, 17),
(21, 1, 17),
(22, 3, 21),
(23, 3, 23),
(24, 1, 23);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Tarifas`
--

CREATE TABLE `Tarifas` (
  `Id` int(11) NOT NULL,
  `Empresa_id` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Valor` float NOT NULL,
  `Valor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Tarifas`
--

INSERT INTO `Tarifas` (`Id`, `Empresa_id`, `Nombre`, `Valor`, `Valor_id`) VALUES
(5, 1, 'MEGA_desarrollo', 0.69, 2),
(6, 1, 'MEGA_soporte/incidencias/reuniones (8:00 - 19:00)', 0.87, 2),
(7, 1, 'MEGA_soporte/incidencias/reuniones_horario_invalid', 1, 2),
(8, 1, 'MEGA_presencial', 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Trabajos`
--

CREATE TABLE `Trabajos` (
  `Id` int(11) NOT NULL,
  `Descripcion` varchar(256) DEFAULT NULL,
  `Empresa_id` int(11) NOT NULL,
  `Fecha_inicio` timestamp NOT NULL DEFAULT current_timestamp(),
  `Fecha_fin` timestamp NULL DEFAULT NULL,
  `Tarifa_id` int(11) NOT NULL,
  `Historia_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Trabajos`
--

INSERT INTO `Trabajos` (`Id`, `Descripcion`, `Empresa_id`, `Fecha_inicio`, `Fecha_fin`, `Tarifa_id`, `Historia_id`) VALUES
(1, 'Definicion de endponts, setup del proyecto, investigacion de idp\'s', 1, '2023-07-06 04:00:00', '2023-07-06 05:30:00', 5, 1),
(2, 'Mockup de endpoints para idp\'s', 1, '2023-07-07 04:00:00', '2023-07-07 08:30:00', 5, 1),
(3, 'Cordinar tareas del mes', 1, '2023-06-30 04:00:00', '2023-06-30 04:30:00', 6, 1),
(4, 'Modificar cron para baja de subscripcione; agregar plan_end_date y poblar cupones al obtener subscripciones', 1, '2023-07-03 13:30:00', '2023-07-03 17:45:00', 6, 1),
(5, 'Cordinacion de boletas y credenciales', 1, '2023-07-04 13:00:00', '2023-07-04 13:45:00', 6, 1),
(6, 'Revision y definicion de uso de ToolBox para subscriptores externos', 1, '2023-07-05 19:00:00', '2023-07-05 21:45:00', 6, 1),
(7, 'Definir endpoints para usuarios externos', 1, '2023-07-07 16:30:00', '2023-07-07 17:30:00', 6, 1),
(8, 'Review/Retro/Planning del sprint', 1, '2023-07-07 20:00:00', '2023-07-07 21:15:00', 6, 1),
(9, 'Conexion con api ToolBox y definicion de tablas', 1, '2023-07-10 14:00:00', '2023-07-10 17:00:00', 5, 1),
(10, 'Creacion de tablas para idps', 1, '2023-07-11 14:00:00', '2023-07-11 17:31:20', 5, 1),
(11, 'Revision estado desarrollo idps', 1, '2023-07-11 21:18:52', '2023-07-11 23:00:00', 6, 1),
(12, 'crear tablas, servicios y modelos para idps', 1, '2023-07-12 17:00:00', '2023-07-12 19:26:03', 5, 1),
(13, 'Integrar controladores con servicios de idp', 1, '2023-07-13 16:00:00', '2023-07-13 20:01:00', 5, 1),
(14, 'Revisar paso a produccion API-PAY(14/07/23)', 1, '2023-07-13 20:00:00', '2023-07-13 21:15:00', 6, 1),
(15, 'Deploy api-pay 1.10.3', 1, '2023-07-14 11:00:00', '2023-07-14 12:30:00', 7, 1),
(16, 'Test e integracion toolbox', 1, '2023-07-17 17:00:00', '2023-07-17 20:20:00', 5, 1),
(17, 'Revision integracion IDP', 1, '2023-07-18 14:00:00', '2023-07-18 16:00:00', 6, 1),
(18, 'Test de Idp', 1, '2023-07-18 22:00:00', '2023-07-18 23:30:00', 5, 1),
(19, 'Finalizar Test unitario para crear usuario con susbcripciones IDP', 1, '2023-07-19 20:00:00', '2023-07-19 23:00:00', 5, 1),
(20, 'Implementacion de controlador test reforzados para sincronizar planes de subscriptores Idp', 1, '2023-07-20 13:00:00', '2023-07-21 00:00:00', 5, 1),
(21, 'Revision implementacion IDP con keycloak', 1, '2023-07-25 17:00:00', '2023-07-25 18:00:00', 6, 1),
(22, 'Inclusion de keycloak a endpoints de IDP', 1, '2023-07-25 18:30:00', '2023-07-25 21:00:00', 5, 1),
(23, 'Verificar estado de Desarrollo IDP', 1, '2023-07-25 21:00:00', '2023-07-25 23:00:00', 6, 1),
(24, 'Pruebas implementacion global y resolucion de problemas IDP', 1, '2023-07-28 20:00:00', '2023-07-28 22:30:00', 6, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Valores`
--

CREATE TABLE `Valores` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(25) NOT NULL,
  `Conversion` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Valores`
--

INSERT INTO `Valores` (`Id`, `Nombre`, `Conversion`) VALUES
(1, 'CLP', 1),
(2, 'UF_CL', 36090),
(3, 'USD', 816.28);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Empresas`
--
ALTER TABLE `Empresas`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `Historias`
--
ALTER TABLE `Historias`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_historia_compañia` (`Empresa_id`);

--
-- Indices de la tabla `Personas`
--
ALTER TABLE `Personas`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_empleado_compañia` (`Empresa_id`);

--
-- Indices de la tabla `Personas_trabajo`
--
ALTER TABLE `Personas_trabajo`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_empleado_trabajo` (`Persona_id`),
  ADD KEY `FK_trabajo_empleado` (`Trabajo_id`);

--
-- Indices de la tabla `Tarifas`
--
ALTER TABLE `Tarifas`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_compañia_tarifa` (`Empresa_id`),
  ADD KEY `FK_valor_tarifa` (`Valor_id`);

--
-- Indices de la tabla `Trabajos`
--
ALTER TABLE `Trabajos`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_tarifa_trabajo` (`Tarifa_id`),
  ADD KEY `FK_empresa_trabajo` (`Empresa_id`),
  ADD KEY `FK_historia_trabajo` (`Historia_id`);

--
-- Indices de la tabla `Valores`
--
ALTER TABLE `Valores`
  ADD PRIMARY KEY (`Id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Empresas`
--
ALTER TABLE `Empresas`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `Historias`
--
ALTER TABLE `Historias`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `Personas`
--
ALTER TABLE `Personas`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `Personas_trabajo`
--
ALTER TABLE `Personas_trabajo`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `Tarifas`
--
ALTER TABLE `Tarifas`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `Trabajos`
--
ALTER TABLE `Trabajos`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `Valores`
--
ALTER TABLE `Valores`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Historias`
--
ALTER TABLE `Historias`
  ADD CONSTRAINT `FK_historia_compañia` FOREIGN KEY (`Empresa_id`) REFERENCES `Empresas` (`Id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `Personas`
--
ALTER TABLE `Personas`
  ADD CONSTRAINT `FK_empleado_compañia` FOREIGN KEY (`Empresa_id`) REFERENCES `Empresas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `Personas_trabajo`
--
ALTER TABLE `Personas_trabajo`
  ADD CONSTRAINT `FK_empleado_trabajo` FOREIGN KEY (`Persona_id`) REFERENCES `Personas` (`Id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_trabajo_empleado` FOREIGN KEY (`Trabajo_id`) REFERENCES `Trabajos` (`Id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `Tarifas`
--
ALTER TABLE `Tarifas`
  ADD CONSTRAINT `FK_compañia_tarifa` FOREIGN KEY (`Empresa_id`) REFERENCES `Empresas` (`Id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_valor_tarifa` FOREIGN KEY (`Valor_id`) REFERENCES `Valores` (`Id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `Trabajos`
--
ALTER TABLE `Trabajos`
  ADD CONSTRAINT `FK_empresa_trabajo` FOREIGN KEY (`Empresa_id`) REFERENCES `Empresas` (`Id`),
  ADD CONSTRAINT `FK_historia_trabajo` FOREIGN KEY (`Historia_id`) REFERENCES `Historias` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_tarifa_trabajo` FOREIGN KEY (`Tarifa_id`) REFERENCES `Tarifas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
