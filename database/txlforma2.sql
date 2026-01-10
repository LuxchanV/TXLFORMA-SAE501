-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 10 jan. 2026 à 23:48
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `txlforma2`
--

-- --------------------------------------------------------

--
-- Structure de la table `attestations`
--

CREATE TABLE `attestations` (
  `id_attestation` bigint(20) NOT NULL,
  `content_type` varchar(100) DEFAULT NULL,
  `data` longblob NOT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  `id_inscription` bigint(20) NOT NULL,
  `source` enum('AUTO','MANUAL') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `attestations`
--

INSERT INTO `attestations` (`id_attestation`, `content_type`, `data`, `original_filename`, `uploaded_at`, `id_inscription`, `source`) VALUES
(1, 'application/pdf', 0x255044462d312e350a25e2e3cfd30a332030206f626a0a3c3c2f46696c7465722f466c6174654465636f64652f4c656e677468203830373e3e73747265616d0a789ca5554b6edb3010ddeb14b34cd158e64724e5ac9a344e9022bf3a5a74abd84cc042911c89728bde23c7297a9d7ad52b744825fe4836e0248260d1e2bcf766469c99c7e031a0f02320a18a234ea1fd1c9d0691044507f0108868e0575970137cdd09c72212ca6764b36eb00e7d9478e63886641210e809fabca0fe4dff84016590dc057bf021f98e1b646d7fed2da53214d063aa41527036883c4c92e14d72989c5d5dc2f1104eae4617fe8f83f61a10d94555aa502ab47180172beaad46f3bb79a9f3b1860368d47a8c30d9237851e1d7845202783db99fe3796666e55c43e61094f409ed3b23ef5123b393479bf340bc8face5e3655157fbdecca7a679997c3b6ff2d1bc5f18ef436aadae6c9157f058a3939b44b738c508f59f81bda409d584b71ae6bf0a38cc6d9debca87da98ee1c6a37a814aadacc0c6429dc15e5436a4d9183c9adb1753677b96dc5fbb9a8cb0a261a8e329d4f74f98ab0dc3e7fdf57513bc12917a1a44e6d79ce06eb5f0b4fd1b8c86d3ab69feccfcc471e66c538cd70e323e7801548167773cc1b522f304cb0f44818332e38b49f58b2aea2b904bc05e3a0d0eb5263c13efa8265f0051d3dc53596ae2324a816c5a0441432f4f761ebf142d915088d65c81928192f306c578cf047eb61253354c1088fe997f436337961310d4a518cfe42a7f5cf7d382953579cafc91a3c39fdb6321f38ddbd9bb3d1303900b2763dfbbb9e26829ebafe184ba604b49f4d7f8c04563c5025432200bba6cff64e6086458698868033190e5e49e0d411f63e754ff046753e10ef536f08deaa2ea377aa7b820dea6be52130cbaeabb7aae37a5e9a62a2bbe79cf126b14bcca2e151f6322bdc1ca1727572ac9338512e3ba2e746d7db1597808522a75bc889e8908fe6559dd9d46e1758829621c5fb04fac0c84619aea28ecce1745acec7c677fbad522bc0855452feade01647842dd3596ab28d25dbee6c9c9290b6884e5263618ac3042a5dce4c09dac22ccd0a5c619f71131367cca42c8c0dbb0e72869e8955de456437e63e4f6d5d6e3814cf2836e09db0b61b2bd59118e96a8a631d3ba586e9bf3fbf27e97d716fd0e5ed2c9274248f4da9c77edaf6e17ac1f2c2f11fd6c64fe20a656e6473747265616d0a656e646f626a0a352030206f626a0a3c3c2f436f6e74656e74732033203020522f547970652f506167652f5265736f75726365733c3c2f466f6e743c3c2f46312031203020522f46322032203020523e3e3e3e2f506172656e742034203020522f4d65646961426f785b30203020353935203834325d3e3e0a656e646f626a0a312030206f626a0a3c3c2f537562747970652f54797065312f547970652f466f6e742f42617365466f6e742f48656c7665746963612d426f6c642f456e636f64696e672f57696e416e7369456e636f64696e673e3e0a656e646f626a0a322030206f626a0a3c3c2f537562747970652f54797065312f547970652f466f6e742f42617365466f6e742f48656c7665746963612f456e636f64696e672f57696e416e7369456e636f64696e673e3e0a656e646f626a0a342030206f626a0a3c3c2f4b6964735b35203020525d2f547970652f50616765732f436f756e7420313e3e0a656e646f626a0a362030206f626a0a3c3c2f547970652f436174616c6f672f50616765732034203020523e3e0a656e646f626a0a372030206f626a0a3c3c2f4372656174696f6e4461746528443a32303236303131303139303433312b303127303027292f50726f6475636572284f70656e50444620312e332e3339293e3e0a656e646f626a0a787265660a3020380a303030303030303030302036353533352066200a30303030303031303130203030303030206e200a30303030303031313033203030303030206e200a30303030303030303135203030303030206e200a30303030303031313931203030303030206e200a30303030303030383839203030303030206e200a30303030303031323432203030303030206e200a30303030303031323837203030303030206e200a747261696c65720a3c3c2f496e666f2037203020522f4944205b3c63323062643532366331643137633663346537393132323239346661623839643e3c63323062643532366331643137633663346537393132323239346661623839643e5d2f526f6f742036203020522f53697a6520383e3e0a7374617274787265660a313337300a2525454f460a, 'attestation-ATTEST-2026-000015-20260110.pdf', '2026-01-10 18:04:31.000000', 15, 'AUTO'),
(2, 'application/pdf', 0x255044462d312e350a25e2e3cfd30a332030206f626a0a3c3c2f46696c7465722f466c6174654465636f64652f4c656e677468203831343e3e73747265616d0a789ca5554b6edb3010ddeb14d35d8ac6323f122567d504f920457e7584a25bc65652168ae448949b8be43845af53ad7a850e49c71fc9069c58104c5a9cf7de70c89979f29e3c0abf3ce24771c029b4c7e199170888e8001ebd3018d859e6dd7a5fb7c2b180f8628674738735e8a3c432c73124638f402fa4b309b55ffaa70c2883e4dedb838fc94f5c202beb2b5f29157e083d163924056383c8c32439b94d0e93f3eb2b383e81d3ebe1a5fd63a03d0722dba88ac81711da18c0ab15b556c3e6be29d37c94c20138b51e234cf4083e8cd839a194003e2fe6e7b8c9d4b46c52c80c82923ea17d63643d72325b79b43e0ec4fac85a3e5e1575b56fcd6c68dcc7e4fb858b87fb3e37de07a9755ae922afe0a94627d7896e708ac678c4e61cd86b9c502eb466df642573fd43e670513f8f707447e0005befb8bb370955ada60a3209f745f928b52a7250b956bace1a13e2d6b66f27a5ca1fe0a828341c4e653e6adeb03fb3ce773b9e68bb40f2d017d4a82d2edc60f5d8f03a8d8a5ccb91feac9f33bb773f2b4632c3854f9c03a62299bf2ed88ed40a9c249883c48f190f39b447cc5d93da5c00be21e310a1d7658a99fb643397c11774f40ce798c38690a05a104314063e437f1f37de33945d82d058f89c4124e239866d8b09ed157b5c8a0c8d6088f7f58bbccb548ea7fb826e53dcfd652aebe77d382da5c9d2b7440d5e8c7e5b990f8ceedeedf9f0243900b2f2ccfc5d0d13414f4da18c058b42688fae500621a63ed048f824042c9f36da5b8119261b621c0167c21fbc91c0a8236c37754bf04e753e0877537704ef5517c18eea96608dfa4a7a84186553de5bd971d394aa18a7dd7bceb80bec02332f7994bd360dd350a8586e21ab2446948b8ee8854aebcd8a0bc04291f3f5e424ec900f9baaceb4d49b0516a08540bc4fa00f8cac95e151d091399c4cca66a46cbddf28b5049c4b25e5df0aeeb049e8524ea5cae0c3daa46dd7364e894f5b54a7526998147509555a4e5509a986a9cc0a9c61a531cd738c6f5928ed775de42c30ad6f8977d1a3d4432e755daeb91633141bf0cec6361b47514762985613ecf0582b5398fcfbf37b2c1f8a07852e6f6611a42379acca74643b6e1f6ee62caf1cff01f79e53d90a656e6473747265616d0a656e646f626a0a352030206f626a0a3c3c2f436f6e74656e74732033203020522f547970652f506167652f5265736f75726365733c3c2f466f6e743c3c2f46312031203020522f46322032203020523e3e3e3e2f506172656e742034203020522f4d65646961426f785b30203020353935203834325d3e3e0a656e646f626a0a312030206f626a0a3c3c2f537562747970652f54797065312f547970652f466f6e742f42617365466f6e742f48656c7665746963612d426f6c642f456e636f64696e672f57696e416e7369456e636f64696e673e3e0a656e646f626a0a322030206f626a0a3c3c2f537562747970652f54797065312f547970652f466f6e742f42617365466f6e742f48656c7665746963612f456e636f64696e672f57696e416e7369456e636f64696e673e3e0a656e646f626a0a342030206f626a0a3c3c2f4b6964735b35203020525d2f547970652f50616765732f436f756e7420313e3e0a656e646f626a0a362030206f626a0a3c3c2f547970652f436174616c6f672f50616765732034203020523e3e0a656e646f626a0a372030206f626a0a3c3c2f4372656174696f6e4461746528443a32303236303131303231353630362b303127303027292f50726f6475636572284f70656e50444620312e332e3339293e3e0a656e646f626a0a787265660a3020380a303030303030303030302036353533352066200a30303030303031303137203030303030206e200a30303030303031313130203030303030206e200a30303030303030303135203030303030206e200a30303030303031313938203030303030206e200a30303030303030383936203030303030206e200a30303030303031323439203030303030206e200a30303030303031323934203030303030206e200a747261696c65720a3c3c2f496e666f2037203020522f4944205b3c63326165366634633239356265653961386564343739383436363932313439643e3c63326165366634633239356265653961386564343739383436363932313439643e5d2f526f6f742036203020522f53697a6520383e3e0a7374617274787265660a313337370a2525454f460a, 'attestation-ATTEST-2026-000020-20260110.pdf', '2026-01-10 20:56:06.000000', 20, 'AUTO');

-- --------------------------------------------------------

--
-- Structure de la table `categories_formation`
--

CREATE TABLE `categories_formation` (
  `id_categorie` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories_formation`
--

INSERT INTO `categories_formation` (`id_categorie`, `description`, `nom`) VALUES
(1, NULL, 'Développement Web'),
(2, NULL, '3D Blender'),
(3, NULL, 'React + Spring Boot');

-- --------------------------------------------------------

--
-- Structure de la table `emargements`
--

CREATE TABLE `emargements` (
  `id_emargement` bigint(20) NOT NULL,
  `date_jour` date NOT NULL,
  `present` bit(1) NOT NULL,
  `id_inscription` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `emargements`
--

INSERT INTO `emargements` (`id_emargement`, `date_jour`, `present`, `id_inscription`) VALUES
(1, '2026-01-06', b'1', 2),
(2, '2026-01-06', b'1', 5),
(3, '2026-01-07', b'1', 6),
(4, '2026-01-07', b'1', 8),
(5, '2026-01-08', b'1', 20),
(6, '2026-01-10', b'1', 6),
(7, '2026-01-10', b'1', 11),
(8, '2026-01-10', b'1', 10),
(9, '2026-01-10', b'1', 15),
(10, '2026-01-10', b'1', 20);

-- --------------------------------------------------------

--
-- Structure de la table `evaluations`
--

CREATE TABLE `evaluations` (
  `id_evaluation` bigint(20) NOT NULL,
  `commentaire` text DEFAULT NULL,
  `note` double NOT NULL,
  `id_inscription` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `evaluations`
--

INSERT INTO `evaluations` (`id_evaluation`, `commentaire`, `note`, `id_inscription`) VALUES
(1, 'Bien', 15, 2),
(2, ' Très belle modélisation', 17, 5),
(3, 'Très bon travail ! ', 18, 20),
(4, 'Très bon travail Anzo ! ', 15, 11),
(8, 'Très bon travail', 18, 15);

-- --------------------------------------------------------

--
-- Structure de la table `formations`
--

CREATE TABLE `formations` (
  `id_formation` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `duree_heures` int(11) DEFAULT NULL,
  `niveau` varchar(50) DEFAULT NULL,
  `prix` double DEFAULT NULL,
  `titre` varchar(150) NOT NULL,
  `id_categorie` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `formations`
--

INSERT INTO `formations` (`id_formation`, `description`, `duree_heures`, `niveau`, `prix`, `titre`, `id_categorie`) VALUES
(1, 'Cours de Spring Boot', 45, 'Débutant', 123, 'Spring Boot', 1),
(2, 'Nouveau langage', NULL, 'Débutant', 83, 'React', 1),
(3, '3D', 20, 'Débutant', 120, 'Cours de Blender', 2),
(4, 'Spring Boot Avancé VS CODE', 40, 'Débutant', 100, 'Spring Boot Avancé', 3);

-- --------------------------------------------------------

--
-- Structure de la table `heures_realisees`
--

CREATE TABLE `heures_realisees` (
  `id_heures` bigint(20) NOT NULL,
  `date_jour` date NOT NULL,
  `heures` double NOT NULL,
  `id_session` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `inscriptions`
--

CREATE TABLE `inscriptions` (
  `id_inscription` bigint(20) NOT NULL,
  `date_inscription` datetime(6) NOT NULL,
  `statut` enum('ANNULEE','EN_ATTENTE_PAIEMENT','PAYEE') NOT NULL,
  `id_session` bigint(20) NOT NULL,
  `id_utilisateur` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `inscriptions`
--

INSERT INTO `inscriptions` (`id_inscription`, `date_inscription`, `statut`, `id_session`, `id_utilisateur`) VALUES
(1, '2026-01-05 23:35:54.000000', 'ANNULEE', 1, 1),
(2, '2026-01-06 01:08:51.000000', 'PAYEE', 2, 1),
(3, '2026-01-06 01:11:02.000000', 'PAYEE', 3, 1),
(4, '2026-01-06 13:47:38.000000', 'PAYEE', 4, 1),
(5, '2026-01-06 14:09:40.000000', 'PAYEE', 5, 1),
(6, '2026-01-07 12:41:28.000000', 'PAYEE', 6, 1),
(7, '2026-01-07 12:42:12.000000', 'PAYEE', 7, 1),
(8, '2026-01-07 12:49:52.000000', 'PAYEE', 2, 8),
(9, '2026-01-07 14:48:09.000000', 'PAYEE', 6, 10),
(10, '2026-01-07 14:53:02.000000', 'PAYEE', 6, 9),
(11, '2026-01-07 15:01:43.000000', 'PAYEE', 7, 9),
(12, '2026-01-08 16:34:00.000000', 'PAYEE', 7, 10),
(13, '2026-01-08 16:34:26.000000', 'PAYEE', 6, 8),
(14, '2026-01-08 16:36:22.000000', 'PAYEE', 5, 8),
(15, '2026-01-08 16:56:49.000000', 'PAYEE', 5, 9),
(16, '2026-01-08 17:36:48.000000', 'PAYEE', 5, 10),
(17, '2026-01-08 18:23:41.000000', 'PAYEE', 4, 9),
(18, '2026-01-08 18:50:59.000000', 'PAYEE', 3, 8),
(19, '2026-01-08 18:51:33.000000', 'PAYEE', 4, 8),
(20, '2026-01-08 19:04:47.000000', 'PAYEE', 8, 1);

-- --------------------------------------------------------

--
-- Structure de la table `intervenants`
--

CREATE TABLE `intervenants` (
  `id_intervenant` bigint(20) NOT NULL,
  `specialite` varchar(150) DEFAULT NULL,
  `statut` varchar(20) DEFAULT NULL,
  `taux_horaire` double DEFAULT NULL,
  `id_utilisateur` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `intervenants`
--

INSERT INTO `intervenants` (`id_intervenant`, `specialite`, `statut`, `taux_horaire`, `id_utilisateur`) VALUES
(1, 'Dév Web', 'FREELANCE', 42, 3),
(3, '3D Blender', 'VACATAIRE', 65, 6),
(4, 'UX / UI Design', 'CDD', 30, 7),
(5, 'Développement Web Front et Back', 'CDD', 50, 11);

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

CREATE TABLE `paiements` (
  `id_paiement` bigint(20) NOT NULL,
  `date_paiement` datetime(6) NOT NULL,
  `mode_paiement` varchar(50) NOT NULL,
  `montant` double NOT NULL,
  `reference_externe` varchar(255) DEFAULT NULL,
  `statut` enum('ECHEC','EN_ATTENTE','SUCCES') NOT NULL,
  `id_inscription` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `paiements`
--

INSERT INTO `paiements` (`id_paiement`, `date_paiement`, `mode_paiement`, `montant`, `reference_externe`, `statut`, `id_inscription`) VALUES
(1, '2026-01-05 23:35:57.000000', 'CARTE_TEST', 123, 'sandbox_553d736f-ae79-4c67-b5fb-50ed4a533afc', 'EN_ATTENTE', 1),
(2, '2026-01-05 23:35:57.000000', 'CARTE_TEST', 123, 'sandbox_a1ba5fe3-042c-4619-bd6a-f04e2dd86a88', 'EN_ATTENTE', 1),
(3, '2026-01-05 23:36:11.000000', 'CARTE_TEST', 123, 'sandbox_2c30d6e5-fb06-4d4d-b878-45dd19f9af6f', 'SUCCES', 1),
(4, '2026-01-06 01:08:56.000000', 'CARTE_TEST', 123, 'sandbox_21b88c82-9659-4a85-b4d3-839def282e80', 'SUCCES', 2),
(5, '2026-01-06 01:11:12.000000', 'CARTE_TEST', 83, 'sandbox_c10861ac-692c-45e2-aead-b63fec7c789e', 'SUCCES', 3),
(6, '2026-01-06 13:47:51.000000', 'CARTE_TEST', 120, 'sandbox_dd949b22-10e0-4073-b0e7-15f80430417c', 'EN_ATTENTE', 4),
(7, '2026-01-06 13:47:51.000000', 'CARTE_TEST', 120, 'sandbox_d06e8874-a80d-427b-a995-7873863bdd4b', 'EN_ATTENTE', 4),
(8, '2026-01-06 13:48:10.000000', 'CARTE_TEST', 120, 'sandbox_5cf63727-d3a6-455f-ae23-b65d56a8998c', 'SUCCES', 4),
(9, '2026-01-06 14:09:46.000000', 'CARTE_TEST', 120, 'sandbox_ce167557-693d-4880-97d8-6a49ba789979', 'EN_ATTENTE', 5),
(10, '2026-01-06 14:10:56.000000', 'CARTE_TEST', 120, 'sandbox_683d86c2-8a39-4877-8dca-6a3f626936d7', 'SUCCES', 5),
(11, '2026-01-07 12:41:36.000000', 'CARTE_TEST', 120, 'PI_TEST_7e73a33f-7d8f-439f-ab3f-9c776bcd7162', 'SUCCES', 6),
(12, '2026-01-07 12:42:36.000000', 'CARTE_TEST', 120, 'PI_TEST_17d5427a-1e65-457a-bc5b-494c5322405f', 'SUCCES', 7),
(13, '2026-01-07 12:50:09.000000', 'CARTE_TEST', 123, 'PI_TEST_16a95b81-7dc4-401b-806d-d8c31a04412c', 'SUCCES', 8),
(17, '2026-01-07 14:52:47.000000', 'CARTE_TEST', 120, 'PI_TEST_d5aec686-42f7-49bb-807e-831cb65e8059', 'SUCCES', 9),
(21, '2026-01-07 15:00:07.000000', 'STRIPE', 120, 'CANCELLED_DUPLICATE_33fb5e6f-be7d-4e46-ad58-83c7d1a7982a', 'ECHEC', 10),
(22, '2026-01-07 15:00:07.000000', 'STRIPE', 120, 'CANCELLED_DUPLICATE_82e1e681-4229-45f2-8f94-69a3e46eed3c', 'ECHEC', 10),
(23, '2026-01-07 15:01:26.000000', 'CARTE_TEST', 120, 'PI_TEST_38f63656-1783-4bec-9607-4b1f3c26678b', 'SUCCES', 10),
(24, '2026-01-07 15:01:47.000000', 'STRIPE', 120, 'CANCELLED_DUPLICATE_8f7830e0-73f5-481f-807a-aaac554523c8', 'ECHEC', 11),
(25, '2026-01-08 16:33:41.000000', 'CARTE_TEST', 120, 'PI_TEST_82a3715e-6e1b-4f5f-a38b-221cfc5f9f92', 'SUCCES', 11),
(26, '2026-01-07 15:01:47.000000', 'STRIPE', 120, 'CANCELLED_DUPLICATE_27b71c55-4dcd-4fa6-9088-7dfac48b1448', 'ECHEC', 11),
(27, '2026-01-08 16:34:03.000000', 'CARTE_TEST', 120, 'PI_TEST_608676ba-353c-40f9-ba84-377990806720', 'SUCCES', 12),
(28, '2026-01-08 16:34:30.000000', 'CARTE_TEST', 120, 'PI_TEST_23f46ba7-ac7d-4e84-a755-4984e82a90ba', 'SUCCES', 13),
(29, '2026-01-08 16:36:24.000000', 'CARTE_TEST', 120, 'PI_TEST_20dbfcd1-fd2d-4517-94bc-35f51b068e06', 'SUCCES', 14),
(30, '2026-01-08 16:56:52.000000', 'CARTE_TEST', 120, 'PI_TEST_b06bbbea-a3e8-4a51-8122-ce6536a39265', 'SUCCES', 15),
(31, '2026-01-08 18:22:53.000000', 'STRIPE', 120, 'pi_3SnN8jPSFymmWvL60WsRlq22', 'SUCCES', 16),
(32, '2026-01-08 18:24:00.000000', 'STRIPE', 120, 'pi_3SnNs4PSFymmWvL61KWQ0NYL', 'SUCCES', 17),
(33, '2026-01-08 18:51:12.000000', 'STRIPE', 83, 'pi_3SnOITPSFymmWvL61bl4OTuv', 'SUCCES', 18),
(34, '2026-01-08 18:52:40.000000', 'STRIPE', 120, 'pi_3SnOJ2PSFymmWvL61cNvY3FE', 'SUCCES', 19),
(35, '2026-01-08 19:04:59.000000', 'STRIPE', 100, 'pi_3SnOVqPSFymmWvL61KjrGHcI', 'SUCCES', 20);

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id_session` bigint(20) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `nb_places_max` int(11) NOT NULL,
  `salle` varchar(100) DEFAULT NULL,
  `statut` enum('ANNULEE','COMPLETE','OUVERTE','PLANIFIEE','TERMINEE') NOT NULL,
  `id_formation` bigint(20) NOT NULL,
  `id_intervenant` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id_session`, `date_debut`, `date_fin`, `nb_places_max`, `salle`, `statut`, `id_formation`, `id_intervenant`) VALUES
(1, '2026-01-06', '2026-01-10', 12, 'B4', 'ANNULEE', 1, NULL),
(2, '2026-01-07', '2026-01-10', 12, '311', 'OUVERTE', 1, 1),
(3, '2026-01-12', '2026-01-17', 12, 'A4', 'OUVERTE', 2, 1),
(4, '2026-01-06', '2026-01-10', 12, '316', 'OUVERTE', 3, 3),
(5, '2026-01-12', '2026-01-16', 12, '316', 'OUVERTE', 3, 4),
(6, '2026-01-19', '2026-01-24', 12, '316', 'OUVERTE', 3, 4),
(7, '2026-01-14', '2026-01-17', 12, '136', 'OUVERTE', 3, 4),
(8, '2026-01-12', '2026-01-16', 12, '133', 'OUVERTE', 4, 5);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id_utilisateur` bigint(20) NOT NULL,
  `actif` bit(1) NOT NULL,
  `adresse_postale` varchar(255) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `email` varchar(150) NOT NULL,
  `entreprise` varchar(150) DEFAULT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `role` enum('ROLE_ADMIN','ROLE_FORMATEUR','ROLE_USER') NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `must_change_password` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id_utilisateur`, `actif`, `adresse_postale`, `date_creation`, `email`, `entreprise`, `mot_de_passe`, `nom`, `prenom`, `role`, `telephone`, `must_change_password`) VALUES
(1, b'1', '', '2026-01-05 23:13:23.000000', 'Luxchan@gmail.com', '', '$2a$10$/nWCLRFGkQWIorj943y3ouqAoaYo3Vbr39mlmvwJ9DPUWwP2Zuray', 'Luxchan', 'Vasanthan', 'ROLE_USER', '07123456', b'0'),
(2, b'1', NULL, '2026-01-05 23:33:18.000000', 'admin@txlforma.fr', NULL, '$2a$10$RMtQS8N41vtCXT3azeygeeKgWFBoTYGkHSGn1OFB9hM1c3tMexY3W', 'Admin', 'TXL', 'ROLE_ADMIN', NULL, b'0'),
(3, b'1', NULL, '2026-01-05 23:33:18.000000', 'formateur@txlforma.fr', NULL, '$2a$10$GSkTAUOJBuquzF2jTBHrmOdLqgu73wJvYwlnMP/Xj9P0QDqs/dLru', 'Formateur', 'TXL', 'ROLE_FORMATEUR', NULL, b'0'),
(4, b'1', NULL, '2026-01-06 01:05:30.000000', 'admin@txlforma.local', NULL, '$2a$10$Qe43sCMawjUqVgv7SQ1vqeA/y0IjmM2S1zDEEOVqCFn21GYfO8LLe', 'Admin', 'TXLForma', 'ROLE_ADMIN', NULL, b'0'),
(5, b'1', NULL, '2026-01-06 01:05:30.000000', 'formateur@txlforma.local', NULL, '$2a$10$mkQplN2FYQEMftM.HcGTMuBoBY6i.hSGnM6wKY6N.Qt3E8ch8S4P.', 'Formateur', 'Default', 'ROLE_FORMATEUR', NULL, b'0'),
(6, b'1', NULL, '2026-01-06 13:24:28.000000', 'paul@gmail.com', NULL, '$2a$10$qVDAm1S7U2x/gJ0oKuhivegfNcmJNSDem/UjPMM4oDDnqsomlZrl2', 'Jean', 'Paul', 'ROLE_FORMATEUR', NULL, b'1'),
(7, b'1', NULL, '2026-01-06 13:51:10.000000', 'dupont.leo@gmail.com', NULL, '$2a$10$8CW/ze2NHHF8ILFZzSZUpuMczEaTyTIFt3CljfpC0v/3v7t9bgZn6', 'Dupont', 'Leo', 'ROLE_FORMATEUR', NULL, b'1'),
(8, b'1', NULL, '2026-01-07 12:48:38.000000', 'abeeschan@gmail.com', NULL, '$2a$10$CkcXywD.GHdfZ4x7A0XseOIH.714pgS9yxwbV.cDDxR7FhdsUx.9S', 'Krishnakumar', 'Abeeschan', 'ROLE_USER', '0712345678', b'0'),
(9, b'1', '', '2026-01-07 12:49:10.000000', 'enzo@gmail.com', '', '$2a$10$QWqI1RFtRD4s.ZVeMa4sFemliXbZySW1FAPvDD9JcBA3acsFOaRWG', 'Antunes', 'Enzo', 'ROLE_USER', '071234567', b'0'),
(10, b'1', '', '2026-01-07 12:49:44.000000', 'nicolas@gmail.com', '', '$2a$10$tUjTkV1Diqnu0kcbXSYC.OSn4ib4MlwBtWx193g4rWFaNyFOoTxgW', 'Rannou', 'Nicolas', 'ROLE_USER', '071234567', b'0'),
(11, b'1', NULL, '2026-01-08 19:01:49.000000', 'laroussi.reda@gmail.com', NULL, '$2a$10$aDPOcL3oRIAa680DuuDtyeBxLf3yDQ4t0H0eLsquMdGCtZ747qhHS', 'Laroussi', 'Reda', 'ROLE_FORMATEUR', NULL, b'1');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `attestations`
--
ALTER TABLE `attestations`
  ADD PRIMARY KEY (`id_attestation`),
  ADD UNIQUE KEY `uq_attestation_inscription` (`id_inscription`);

--
-- Index pour la table `categories_formation`
--
ALTER TABLE `categories_formation`
  ADD PRIMARY KEY (`id_categorie`);

--
-- Index pour la table `emargements`
--
ALTER TABLE `emargements`
  ADD PRIMARY KEY (`id_emargement`),
  ADD UNIQUE KEY `uq_emargement_inscription_date` (`id_inscription`,`date_jour`);

--
-- Index pour la table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id_evaluation`),
  ADD UNIQUE KEY `UKeubbthndf61puat28t2c7548u` (`id_inscription`);

--
-- Index pour la table `formations`
--
ALTER TABLE `formations`
  ADD PRIMARY KEY (`id_formation`),
  ADD KEY `FKe19h2e0345fs1l97wwbbbl3j8` (`id_categorie`);

--
-- Index pour la table `heures_realisees`
--
ALTER TABLE `heures_realisees`
  ADD PRIMARY KEY (`id_heures`),
  ADD UNIQUE KEY `uq_heures_session_date` (`id_session`,`date_jour`);

--
-- Index pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  ADD PRIMARY KEY (`id_inscription`),
  ADD UNIQUE KEY `uq_inscription_user_session` (`id_utilisateur`,`id_session`),
  ADD KEY `FKk6q6qp90jc942uaa686cmlg7k` (`id_session`);

--
-- Index pour la table `intervenants`
--
ALTER TABLE `intervenants`
  ADD PRIMARY KEY (`id_intervenant`),
  ADD UNIQUE KEY `UKmxi0n6xqsppjo845blurgioef` (`id_utilisateur`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id_paiement`),
  ADD KEY `FKw90m4svoauedb71eam4pvrj7` (`id_inscription`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id_session`),
  ADD KEY `FKst48vn0brgqv719vp67hbt752` (`id_formation`),
  ADD KEY `FK8h0lq5leo64kxomllleymeyo4` (`id_intervenant`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `UK6ldvumu3hqvnmmxy1b6lsxwqy` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `attestations`
--
ALTER TABLE `attestations`
  MODIFY `id_attestation` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `categories_formation`
--
ALTER TABLE `categories_formation`
  MODIFY `id_categorie` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `emargements`
--
ALTER TABLE `emargements`
  MODIFY `id_emargement` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id_evaluation` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `formations`
--
ALTER TABLE `formations`
  MODIFY `id_formation` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `heures_realisees`
--
ALTER TABLE `heures_realisees`
  MODIFY `id_heures` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  MODIFY `id_inscription` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `intervenants`
--
ALTER TABLE `intervenants`
  MODIFY `id_intervenant` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id_paiement` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT pour la table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id_session` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id_utilisateur` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `attestations`
--
ALTER TABLE `attestations`
  ADD CONSTRAINT `FK10q9u0bml5rw44hv7f339bjby` FOREIGN KEY (`id_inscription`) REFERENCES `inscriptions` (`id_inscription`);

--
-- Contraintes pour la table `emargements`
--
ALTER TABLE `emargements`
  ADD CONSTRAINT `FKenj1x40nbrbj25qgmlbj5emgu` FOREIGN KEY (`id_inscription`) REFERENCES `inscriptions` (`id_inscription`);

--
-- Contraintes pour la table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `FKbmtca8m7xb3ngttne71t4npm9` FOREIGN KEY (`id_inscription`) REFERENCES `inscriptions` (`id_inscription`);

--
-- Contraintes pour la table `formations`
--
ALTER TABLE `formations`
  ADD CONSTRAINT `FKe19h2e0345fs1l97wwbbbl3j8` FOREIGN KEY (`id_categorie`) REFERENCES `categories_formation` (`id_categorie`);

--
-- Contraintes pour la table `heures_realisees`
--
ALTER TABLE `heures_realisees`
  ADD CONSTRAINT `FKnku0y1kupw1ds66j6l7of1xbj` FOREIGN KEY (`id_session`) REFERENCES `sessions` (`id_session`);

--
-- Contraintes pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  ADD CONSTRAINT `FKk6q6qp90jc942uaa686cmlg7k` FOREIGN KEY (`id_session`) REFERENCES `sessions` (`id_session`),
  ADD CONSTRAINT `FKo3anqlnc6168b8r0ymbnlrokr` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`);

--
-- Contraintes pour la table `intervenants`
--
ALTER TABLE `intervenants`
  ADD CONSTRAINT `FKcuhk0985exiqiexrx0ei1e1hc` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`);

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `FKw90m4svoauedb71eam4pvrj7` FOREIGN KEY (`id_inscription`) REFERENCES `inscriptions` (`id_inscription`);

--
-- Contraintes pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `FK8h0lq5leo64kxomllleymeyo4` FOREIGN KEY (`id_intervenant`) REFERENCES `intervenants` (`id_intervenant`),
  ADD CONSTRAINT `FKst48vn0brgqv719vp67hbt752` FOREIGN KEY (`id_formation`) REFERENCES `formations` (`id_formation`);
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
