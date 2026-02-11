-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 21, 2026 at 09:51 AM
-- Server version: 8.0.31
-- PHP Version: 8.1.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `payroll_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `allowances`
--

DROP TABLE IF EXISTS `allowances`;
CREATE TABLE IF NOT EXISTS `allowances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `allowance_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `allowance_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `is_percentage` tinyint(1) DEFAULT '0',
  `default_amount` decimal(15,2) DEFAULT '0.00',
  `is_bonded` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_archived` tinyint(1) DEFAULT '0',
  `eligible_status` enum('permanent','contract','both') COLLATE utf8mb4_general_ci DEFAULT 'both',
  PRIMARY KEY (`id`),
  UNIQUE KEY `allowance_code` (`allowance_code`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `allowances`
--

INSERT INTO `allowances` (`id`, `allowance_code`, `allowance_name`, `description`, `is_percentage`, `default_amount`, `is_bonded`, `created_at`, `updated_at`, `is_archived`, `eligible_status`) VALUES
(11, 'DEP', 'Dependent', '', 1, '5.00', 0, '2026-01-15 11:08:32', '2026-01-21 09:36:29', 0, 'permanent'),
(10, 'FAM', 'Family', '', 1, '20.00', 0, '2026-01-14 08:36:24', '2026-01-14 08:36:24', 0, 'permanent'),
(9, 'Rent', 'Rent', '', 1, '15.00', 0, '2026-01-14 08:35:30', '2026-01-14 08:35:37', 0, 'permanent'),
(8, 'LUN', 'Lunch', '', 0, '160.00', 0, '2026-01-14 08:34:56', '2026-01-14 08:34:56', 0, 'permanent'),
(7, 'ACT', 'Acting', 'Acting', 0, '150.00', 0, '2026-01-14 08:34:26', '2026-01-20 18:34:00', 0, 'both');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `table_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `old_values` text COLLATE utf8mb4_general_ci,
  `new_values` text COLLATE utf8mb4_general_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES
(1, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2025-11-19 10:23:05'),
(2, 1, 'CREATE', 'departments', 1, NULL, NULL, NULL, '2025-11-19 10:24:05'),
(3, 1, 'CREATE', 'departments', 2, NULL, NULL, NULL, '2025-11-19 10:24:27'),
(4, 1, 'CREATE', 'departments', 3, NULL, NULL, NULL, '2025-11-19 10:24:49'),
(5, 1, 'CREATE', 'departments', 4, NULL, NULL, NULL, '2025-11-19 10:25:12'),
(6, 1, 'CREATE', 'departments', 5, NULL, NULL, NULL, '2025-11-19 10:25:30'),
(7, 1, 'UPDATE', 'departments', 5, NULL, NULL, NULL, '2025-11-19 10:25:56'),
(8, 1, 'CREATE', 'designations', 1, NULL, NULL, NULL, '2025-11-19 10:26:26'),
(9, 1, 'CREATE', 'designations', 2, NULL, NULL, NULL, '2025-11-19 10:26:51'),
(10, 1, 'CREATE', 'designations', 3, NULL, NULL, NULL, '2025-11-19 10:27:10'),
(11, 1, 'CREATE', 'designations', 4, NULL, NULL, NULL, '2025-11-19 10:28:09'),
(12, 1, 'CREATE', 'allowances', 1, NULL, NULL, NULL, '2025-11-19 10:28:49'),
(13, 1, 'CREATE', 'allowances', 2, NULL, NULL, NULL, '2025-11-19 10:29:13'),
(14, 1, 'CREATE', 'allowances', 3, NULL, NULL, NULL, '2025-11-19 10:29:41'),
(15, 1, 'CREATE', 'deductions', 1, NULL, NULL, NULL, '2025-11-19 10:30:17'),
(16, 1, 'CREATE', 'deductions', 2, NULL, NULL, NULL, '2025-11-19 10:30:55'),
(17, 1, 'UPDATE', 'deductions', 1, NULL, NULL, NULL, '2025-11-19 10:31:16'),
(18, 1, 'UPDATE', 'deductions', 1, NULL, NULL, NULL, '2025-11-19 10:31:34'),
(19, 1, 'CREATE', 'currency_rates', 1, NULL, NULL, NULL, '2025-11-19 10:31:46'),
(20, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2025-11-19 12:32:27'),
(21, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2025-11-19 12:32:40'),
(22, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-12 12:05:13'),
(23, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-13 09:12:06'),
(24, 1, 'CREATE', 'allowances', 4, NULL, NULL, NULL, '2026-01-13 10:21:37'),
(25, 1, 'CREATE', 'allowances', 5, NULL, NULL, NULL, '2026-01-13 11:41:52'),
(26, 1, 'UPDATE', 'allowances', 2, NULL, NULL, NULL, '2026-01-13 12:06:41'),
(27, 1, 'ARCHIVE', 'allowances', 3, NULL, NULL, NULL, '2026-01-13 12:23:43'),
(28, 1, 'RESTORE', 'allowances', 3, NULL, NULL, NULL, '2026-01-13 12:23:47'),
(29, 1, 'UPDATE', 'allowances', 2, NULL, NULL, NULL, '2026-01-13 12:24:06'),
(30, 1, 'UPDATE', 'allowances', 2, NULL, NULL, NULL, '2026-01-13 12:26:53'),
(31, 1, 'DELETE', 'staffs', 1, NULL, NULL, NULL, '2026-01-13 13:09:12'),
(32, 1, 'DELETE', 'staffs', 2, NULL, NULL, NULL, '2026-01-13 13:11:41'),
(33, 1, 'CREATE', 'allowances', 6, NULL, NULL, NULL, '2026-01-13 13:12:46'),
(34, 1, 'CREATE', 'staffs', 3, NULL, NULL, NULL, '2026-01-13 14:01:49'),
(35, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-14 08:28:17'),
(36, 1, 'CREATE', 'allowances', 7, NULL, NULL, NULL, '2026-01-14 08:34:26'),
(37, 1, 'CREATE', 'allowances', 8, NULL, NULL, NULL, '2026-01-14 08:34:56'),
(38, 1, 'CREATE', 'allowances', 9, NULL, NULL, NULL, '2026-01-14 08:35:30'),
(39, 1, 'UPDATE', 'allowances', 9, NULL, NULL, NULL, '2026-01-14 08:35:37'),
(40, 1, 'CREATE', 'allowances', 10, NULL, NULL, NULL, '2026-01-14 08:36:24'),
(41, 1, 'CREATE', 'staffs', 4, NULL, NULL, NULL, '2026-01-14 08:37:30'),
(42, 1, 'CREATE', 'staffs', 5, NULL, NULL, NULL, '2026-01-14 08:41:35'),
(43, 1, 'CREATE', 'payroll_periods', 1, NULL, NULL, NULL, '2026-01-14 15:30:07'),
(44, 1, 'CREATE', 'payroll_entries', 1, NULL, NULL, NULL, '2026-01-14 15:30:07'),
(45, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-14 20:15:17'),
(46, 1, 'CREATE', 'payroll_entries', 2, NULL, NULL, NULL, '2026-01-14 22:50:16'),
(47, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-14 23:01:00'),
(48, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-14 23:01:10'),
(49, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-15 01:16:34'),
(50, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-15 01:16:43'),
(51, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-15 10:56:26'),
(52, 1, 'CREATE', 'departments', 6, NULL, NULL, NULL, '2026-01-15 11:03:35'),
(53, 1, 'CREATE', 'designations', 5, NULL, NULL, NULL, '2026-01-15 11:06:22'),
(54, 1, 'CREATE', 'allowances', 11, NULL, NULL, NULL, '2026-01-15 11:08:32'),
(55, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-15 13:54:16'),
(56, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-16 11:12:15'),
(57, 1, 'CREATE', 'staffs', 6, NULL, NULL, NULL, '2026-01-16 11:27:08'),
(58, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-16 11:30:16'),
(59, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-18 11:02:27'),
(60, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-18 11:53:00'),
(61, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-18 11:53:25'),
(62, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-19 14:33:06'),
(63, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-19 14:46:41'),
(64, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-20 08:56:16'),
(65, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-20 13:55:04'),
(66, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-20 13:55:13'),
(67, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-20 15:00:05'),
(68, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-20 15:00:13'),
(69, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-20 15:07:25'),
(70, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-20 15:07:46'),
(71, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-20 18:16:45'),
(72, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-20 18:17:09'),
(73, 1, 'UPDATE', 'allowances', 7, NULL, NULL, NULL, '2026-01-20 18:34:00'),
(74, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-20 19:56:27'),
(75, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-20 19:56:38'),
(76, 1, 'LOGOUT', NULL, NULL, NULL, NULL, '::1', '2026-01-20 20:09:09'),
(77, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-20 20:09:16'),
(78, 1, 'CREATE', 'payroll_entries', 3, NULL, NULL, NULL, '2026-01-20 21:20:20'),
(79, 1, 'LOGIN', NULL, NULL, NULL, NULL, '::1', '2026-01-21 08:51:14'),
(80, 1, 'UPDATE', 'allowances', 11, NULL, NULL, NULL, '2026-01-21 09:22:31'),
(81, 1, 'CREATE', 'payroll_periods', 30, NULL, NULL, NULL, '2026-01-21 09:30:50'),
(82, 1, 'CREATE', 'payroll_entries', 4, NULL, NULL, NULL, '2026-01-21 09:30:50'),
(83, 1, 'UPDATE', 'allowances', 11, NULL, NULL, NULL, '2026-01-21 09:36:29');

-- --------------------------------------------------------

--
-- Table structure for table `currency_rates`
--

DROP TABLE IF EXISTS `currency_rates`;
CREATE TABLE IF NOT EXISTS `currency_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency_from` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'USD',
  `currency_to` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'GHS',
  `rate` decimal(15,4) NOT NULL,
  `effective_date` date NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `currency_rates`
--

INSERT INTO `currency_rates` (`id`, `currency_from`, `currency_to`, `rate`, `effective_date`, `created_by`, `created_at`, `is_active`) VALUES
(1, 'USD', 'GHS', '10.9700', '2025-11-19', 1, '2025-11-19 10:31:46', 1);

-- --------------------------------------------------------

--
-- Table structure for table `deductions`
--

DROP TABLE IF EXISTS `deductions`;
CREATE TABLE IF NOT EXISTS `deductions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deduction_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `deduction_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `is_percentage` tinyint(1) DEFAULT '0',
  `default_amount` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `deduction_code` (`deduction_code`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deductions`
--

INSERT INTO `deductions` (`id`, `deduction_code`, `deduction_name`, `description`, `is_percentage`, `default_amount`, `created_at`, `updated_at`, `is_archived`) VALUES
(1, 'SSNIT', 'Personal Pension', '', 1, '5.50', '2025-11-19 10:30:17', '2025-11-19 10:31:34', 0),
(2, 'PEN 2', 'Personal Pension (After Tax)', '', 0, '200.00', '2025-11-19 10:30:55', '2025-11-19 10:30:55', 0);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `department_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `department_code` (`department_code`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `department_code`, `department_name`, `description`, `created_at`, `updated_at`, `is_archived`) VALUES
(1, 'ICT', 'Information and Communications Technology', NULL, '2025-11-19 10:24:05', '2025-11-19 10:24:05', 0),
(2, 'DOT', 'Department of Transport', NULL, '2025-11-19 10:24:27', '2025-11-19 10:24:27', 0),
(3, 'MEE', 'Marine Engineering', NULL, '2025-11-19 10:24:49', '2025-11-19 10:24:49', 0),
(4, 'ME', 'Marine Electrical', NULL, '2025-11-19 10:25:12', '2025-11-19 10:25:12', 0),
(5, 'RES', 'Registry', NULL, '2025-11-19 10:25:30', '2025-11-19 10:25:56', 0),
(6, 'Acc', 'Accounts', NULL, '2026-01-15 11:03:35', '2026-01-15 11:03:35', 0);

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

DROP TABLE IF EXISTS `designations`;
CREATE TABLE IF NOT EXISTS `designations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `designation_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `designation_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `designation_code` (`designation_code`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `designations`
--

INSERT INTO `designations` (`id`, `designation_code`, `designation_name`, `description`, `created_at`, `updated_at`, `is_archived`) VALUES
(1, 'GA', 'Graduate Assistant', NULL, '2025-11-19 10:26:26', '2025-11-19 10:26:26', 0),
(2, 'Asst.Lect', 'Assistant Lecturer', NULL, '2025-11-19 10:26:51', '2025-11-19 10:26:51', 0),
(3, 'Lect', 'Lecturer', NULL, '2025-11-19 10:27:10', '2025-11-19 10:27:10', 0),
(4, 'Snr.Lec', 'Senior Lecturer', NULL, '2025-11-19 10:28:09', '2025-11-19 10:28:09', 0),
(5, 'Prin.Lect', 'Principal Lecturer', NULL, '2026-01-15 11:06:22', '2026-01-15 11:06:22', 0);

-- --------------------------------------------------------

--
-- Table structure for table `payroll_allowances`
--

DROP TABLE IF EXISTS `payroll_allowances`;
CREATE TABLE IF NOT EXISTS `payroll_allowances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payroll_entry_id` int NOT NULL,
  `allowance_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `is_percentage` tinyint(1) DEFAULT '0',
  `percentage_value` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payroll_entry_id` (`payroll_entry_id`),
  KEY `allowance_id` (`allowance_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_allowances`
--

INSERT INTO `payroll_allowances` (`id`, `payroll_entry_id`, `allowance_id`, `amount`, `is_percentage`, `percentage_value`) VALUES
(10, 4, 9, '75.00', 1, '15.00'),
(9, 4, 8, '160.00', 0, '0.00'),
(8, 4, 10, '100.00', 1, '20.00');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_deductions`
--

DROP TABLE IF EXISTS `payroll_deductions`;
CREATE TABLE IF NOT EXISTS `payroll_deductions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payroll_entry_id` int NOT NULL,
  `deduction_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `is_percentage` tinyint(1) DEFAULT '0',
  `percentage_value` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payroll_entry_id` (`payroll_entry_id`),
  KEY `deduction_id` (`deduction_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_deductions`
--

INSERT INTO `payroll_deductions` (`id`, `payroll_entry_id`, `deduction_id`, `amount`, `is_percentage`, `percentage_value`) VALUES
(4, 4, 1, '27.50', 1, '5.50');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_entries`
--

DROP TABLE IF EXISTS `payroll_entries`;
CREATE TABLE IF NOT EXISTS `payroll_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payroll_period_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `currency` enum('GHS','USD') COLLATE utf8mb4_general_ci NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `total_allowances` decimal(15,2) DEFAULT '0.00',
  `total_deductions` decimal(15,2) DEFAULT '0.00',
  `gross_salary` decimal(15,2) NOT NULL,
  `net_salary` decimal(15,2) NOT NULL,
  `currency_rate` decimal(15,4) DEFAULT '1.0000',
  `net_salary_ghs` decimal(15,2) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_finalized` tinyint(1) DEFAULT '0',
  `salary_currency` varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'GHS',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_period` (`payroll_period_id`,`staff_id`),
  KEY `staff_id` (`staff_id`),
  KEY `created_by` (`created_by`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_entries`
--

INSERT INTO `payroll_entries` (`id`, `payroll_period_id`, `staff_id`, `currency`, `basic_salary`, `total_allowances`, `total_deductions`, `gross_salary`, `net_salary`, `currency_rate`, `net_salary_ghs`, `is_approved`, `created_by`, `created_at`, `updated_at`, `is_finalized`, `salary_currency`) VALUES
(4, 30, 4, 'GHS', '500.00', '335.00', '27.50', '835.00', '807.50', '10.9700', '8858.28', 0, 1, '2026-01-21 09:30:50', '2026-01-21 09:30:50', 0, 'GHS');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_periods`
--

DROP TABLE IF EXISTS `payroll_periods`;
CREATE TABLE IF NOT EXISTS `payroll_periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `status` enum('draft','finalized','archived') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`month`,`year`),
  KEY `created_by` (`created_by`)
) ENGINE=MyISAM AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_periods`
--

INSERT INTO `payroll_periods` (`id`, `month`, `year`, `status`, `created_by`, `created_at`, `updated_at`, `approved_at`) VALUES
(30, 1, 2026, 'draft', 1, '2026-01-21 09:30:50', '2026-01-21 09:30:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

DROP TABLE IF EXISTS `staffs`;
CREATE TABLE IF NOT EXISTS `staffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `other_names` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ssnit` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ghana_card` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `designation_id` int DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `basic_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('permanent','contract') COLLATE utf8mb4_general_ci DEFAULT 'permanent',
  `salary_currency` enum('GHS','USD') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'GHS',
  `on_bonded_or_study_leave` tinyint(1) NOT NULL DEFAULT '0',
  `bonded` tinyint(1) DEFAULT '0',
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_number` (`staff_number`),
  UNIQUE KEY `ssnit` (`ssnit`),
  UNIQUE KEY `ghana_card` (`ghana_card`),
  KEY `department_id` (`department_id`),
  KEY `designation_id` (`designation_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staffs`
--

INSERT INTO `staffs` (`id`, `staff_number`, `first_name`, `last_name`, `other_names`, `ssnit`, `ghana_card`, `department_id`, `designation_id`, `bank_name`, `account_number`, `basic_salary`, `status`, `salary_currency`, `on_bonded_or_study_leave`, `bonded`, `hire_date`, `created_at`, `updated_at`, `is_archived`) VALUES
(4, 'ICT001', 'Isaac', 'Acheampong', 'Kwesi', '04439292385', 'GHA-92342222-2', 1, 3, 'ECOBANK', '9876543451', '500.00', 'permanent', 'USD', 0, 0, '2025-12-29', '2026-01-14 08:37:30', '2026-01-14 08:37:30', 0),
(5, 'ICT002', 'Harry', 'Johnson-Agyemang', NULL, '345678944', 'gha234567891', 1, 1, 'ECOBANK', '9876543451', '4500.00', 'contract', 'GHS', 0, 0, '2018-11-14', '2026-01-14 08:41:35', '2026-01-14 08:41:35', 0),
(6, 'srt009', 'Harry', 'Acheampong', 'Kwesi', '044392923857', 'GHA-92342222-9', 2, 1, 'ECOBANK', '9876543456', '6700.00', 'permanent', 'USD', 0, 0, '2026-01-16', '2026-01-16 11:27:08', '2026-01-16 11:27:08', 0);

-- --------------------------------------------------------

--
-- Table structure for table `staff_allowances`
--

DROP TABLE IF EXISTS `staff_allowances`;
CREATE TABLE IF NOT EXISTS `staff_allowances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `allowance_id` int NOT NULL,
  `amount` decimal(15,2) DEFAULT '0.00',
  `is_percentage` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_allowance` (`staff_id`,`allowance_id`),
  KEY `allowance_id` (`allowance_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff_allowances`
--

INSERT INTO `staff_allowances` (`id`, `staff_id`, `allowance_id`, `amount`, `is_percentage`, `created_at`) VALUES
(15, 6, 10, '20.00', 1, '2026-01-16 11:27:08'),
(14, 6, 11, '5.00', 1, '2026-01-16 11:27:08'),
(13, 6, 7, '100.00', 0, '2026-01-16 11:27:08'),
(12, 5, 7, '50.00', 0, '2026-01-14 08:41:35'),
(11, 4, 9, '15.00', 1, '2026-01-14 08:37:30'),
(10, 4, 8, '100.00', 0, '2026-01-14 08:37:30'),
(9, 4, 10, '20.00', 1, '2026-01-14 08:37:30');

-- --------------------------------------------------------

--
-- Table structure for table `staff_deductions`
--

DROP TABLE IF EXISTS `staff_deductions`;
CREATE TABLE IF NOT EXISTS `staff_deductions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `deduction_id` int NOT NULL,
  `amount` decimal(15,2) DEFAULT '0.00',
  `is_percentage` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_deduction` (`staff_id`,`deduction_id`),
  KEY `deduction_id` (`deduction_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff_deductions`
--

INSERT INTO `staff_deductions` (`id`, `staff_id`, `deduction_id`, `amount`, `is_percentage`, `created_at`) VALUES
(2, 4, 1, '5.50', 1, '2026-01-14 08:37:30'),
(3, 5, 1, '5.50', 1, '2026-01-14 08:41:35'),
(4, 6, 1, '5.50', 1, '2026-01-16 11:27:08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','view') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'view',
  `position` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `role`, `position`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'admin', '$2y$10$/8rHe8tJ0jbySZvAlSFcX.lpn.5i353g2CaiBl9FDIs8bp9Opyqda', 'System Administrator', 'admin@university.edu', 'admin', 'HR Manager', '2025-11-19 10:19:38', '2025-11-19 10:22:54', 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
