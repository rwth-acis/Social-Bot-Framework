/*
 Navicat Premium Data Transfer

 Source Server         : tech4comp mobsos
 Source Server Type    : MySQL
 Source Server Version : 50726
 Source Host           : 10.96.233.90:3306
 Source Schema         : SBF

 Target Server Type    : MySQL
 Target Server Version : 50726
 File Encoding         : 65001

 Date: 15/04/2020 22:45:51
*/

CREATE DATABASE IF NOT EXISTS `SBF`
/*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */
;

USE `SBF`;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for attributes
-- ----------------------------
CREATE TABLE IF NOT EXISTS `attributes`  (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `bot` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `channel` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `user` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `key` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `value` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users`  (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `role` int(12) NULL DEFAULT NULL,
  `data_provided` boolean NULL DEFAULT NULL,
  `personal_data` varchar(10000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`, `email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 414 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for models
-- ----------------------------
CREATE TABLE IF NOT EXISTS `models`  (
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `model` MEDIUMBLOB NULL DEFAULT NULL,
  PRIMARY KEY (`name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for training data
-- ----------------------------
CREATE TABLE IF NOT EXISTS `training`  (
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `data` LONGTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
