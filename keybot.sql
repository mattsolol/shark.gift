-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 14, 2021 at 10:59 PM
-- Server version: 10.4.17-MariaDB
-- PHP Version: 8.0.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `keybot`
--

-- --------------------------------------------------------

--
-- Table structure for table `newgamekeys`
--

CREATE TABLE `newgamekeys` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gamekey` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `newgamekeys`
--

INSERT INTO `newgamekeys` (`id`, `name`, `gamekey`) VALUES
(1, 'test', 'aaa-bbb-ccc'),
(2, 'Rain Of Reflections: Set Free', 'NCW04-NXYYJ-GBLBH'),
(3, 'Painkiller Complete Pack', 'N6HCB-4893D-MWE2X'),
(5, 'Aegis of Earth: Protovonus Assault', '0JM9N-B2CJM-TV8KX'),
(9, 'Out', 'of the Box 3V0L3-PLM45-W9G27'),
(13, 'Out of the Box', '3V0L3-PLM45-W9G27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `newgamekeys`
--
ALTER TABLE `newgamekeys`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `newgamekeys`
--
ALTER TABLE `newgamekeys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
