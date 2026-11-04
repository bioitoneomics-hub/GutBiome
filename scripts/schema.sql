-- ONEOMICS MYGUTBIOME - Biomine_DB Database Schema
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS Biomine_DB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Biomine_DB;

-- 1. Samples Table
CREATE TABLE IF NOT EXISTS `samples` (
  `id` VARCHAR(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accession` VARCHAR(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_code` VARCHAR(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `age` INT DEFAULT NULL,
  `sex` ENUM('female','male','unspecified') COLLATE utf8mb4_unicode_ci DEFAULT 'unspecified',
  `indication` TEXT COLLATE utf8mb4_unicode_ci,
  `collection_date` DATE DEFAULT NULL,
  `received_date` DATE DEFAULT NULL,
  `sequenced_date` DATE DEFAULT NULL,
  `profile_id` VARCHAR(64) COLLATE utf8mb4_unicode_ci DEFAULT 'biom-upload',
  `source` ENUM('demo','biom') COLLATE utf8mb4_unicode_ci DEFAULT 'biom',
  `recent_antibiotics` TINYINT(1) DEFAULT '0',
  `diet_pattern` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` TEXT COLLATE utf8mb4_unicode_ci,
  `biom_file_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `biom_sample_id` VARCHAR(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `biom_format` VARCHAR(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `biom_feature_count` INT DEFAULT '0',
  `biom_data` LONGTEXT COLLATE utf8mb4_unicode_ci,
  `amr_findings` JSON DEFAULT NULL,
  `disease_scores` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accession` (`accession`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Reports Table
CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sample_id` VARCHAR(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` ENUM('doctor','patient','detailed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` ENUM('draft','generated','reviewed','signed_off') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `signed_off_by` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `report_payload` LONGTEXT COLLATE utf8mb4_unicode_ci,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reports_sample` (`sample_id`),
  CONSTRAINT `fk_reports_sample` FOREIGN KEY (`sample_id`) REFERENCES `samples` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

