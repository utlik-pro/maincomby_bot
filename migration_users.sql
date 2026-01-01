-- ==================== USERS ====================
-- Total: 471 users

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (1, 1379584180, 'dmitryutlik', 'Дима', 'Утлик', '+375447554000', '2025-11-11 15:01:42.004678', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (7, 8061713882, 'yana_martynen', 'Яна', 'Мартыненко', '+375291785152', '2025-11-13 11:15:33.944920', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (8, 566172330, 'evgeni_rush', 'Евгений', 'Прусак', '+375445741440', '2025-11-13 11:16:50.100524', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (9, 5435629127, 'rework_minsk', 'Тем', 'тест', '+375293741561', '2025-11-14 10:05:59.813416', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (10, 896479212, 'alxndr_msh', 'Александр', 'Машук', '+375445390144', '2025-11-14 10:34:36.014369', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (11, 614025486, 'lelya_serg', 'Покумейко', 'Ольга', '+375447823955', '2025-11-14 10:35:34.090882', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (12, 6902246558, 'trigalina', 'Алина', 'Тригуб', '+375298765678', '2025-11-14 11:28:50.679204', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (13, 462192301, 'Kot_ion', 'Наталья', 'Синдеева', '+375297682636', '2025-11-14 11:42:55.586290', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (14, 6816848440, 'barysm', 'Борис', 'Мамоненко', '+375296170107', '2025-11-14 12:14:54.760663', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (15, 8085062059, 'vitalkov', 'Виталий', 'Ковальчук', '+375447506818', '2025-11-14 12:18:52.889236', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (16, 592370169, NULL, 'Кровецкий', 'Владимир Владимирович', '+375292987654', '2025-11-14 12:28:02.630225', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (17, 648983780, 'LubovYakovitskaya', 'Любовь', 'Яковицкая', '+375293951444', '2025-11-14 12:32:02.369328', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (18, 5116399713, 'andrey_proup', 'Андрей', 'Тепляков', '+375293551188', '2025-11-14 12:37:06.719902', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (19, 477768171, 't_borzenkova', 'Татьяна', 'Величко', '+375291759101', '2025-11-14 12:55:25.540717', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (20, 504035257, 'Zakalve', 'Артур', 'Прокопчик', '+375259879333', '2025-11-14 13:10:57.584163', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (21, 277828702, 'hdzmitry', 'Харькович', 'Дмитрий', '+375296350095', '2025-11-14 13:20:57.550624', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (22, 404180634, 'ShkuratovDesigner', 'Евгений', 'AI Фаундер Шкуратов и просто хороший человек 😎', '+375447750809', '2025-11-14 13:26:11.029931', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (23, 1249891281, 'werghccee', 'Кожух', 'Екатерина', '+375297136287', '2025-11-14 13:59:20.016125', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (24, 504543869, 'Krushevdenis', 'Денис', 'Крушев', '+375296165152', '2025-11-14 15:31:00.305783', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (25, 1930173292, 'h_lizaoao', 'Елизавета', NULL, NULL, '2025-11-14 16:37:19.365689', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (26, 1133673228, 'linaakhd', 'Лина', NULL, NULL, '2025-11-14 16:37:22.119059', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (27, 1615123094, 'evgenius_smm_minsk', 'Евгений', 'Писарев', '+375291410961', '2025-11-14 18:44:05.444538', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (28, 6420467368, 'GCreator_web3', 'SiLeNT', NULL, NULL, '2025-11-14 19:52:24.789200', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (29, 381522921, 'yanadubeshko', 'Yana', 'Dubeshko', '+375295495775', '2025-11-15 17:25:01.415560', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (30, 7319069533, 'Dar_Zlato', 'Ирина', 'Гарусова', '+375447460474', '2025-11-15 17:39:27.531779', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (31, 705825596, 'inchikvinchik', 'Марышева', 'Инесса', '+375293184371', '2025-11-15 20:07:51.427381', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (32, 8170227090, 'miss_mic_murr', 'Руслана', 'Антонова', '+375333186000', '2025-11-15 20:08:18.463693', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (33, 417363684, 'spectre_lp', 'Полешко', 'Кирилл', '+375297516100', '2025-11-15 20:09:49.681718', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (34, 1797975006, 'Cropfleet', 'Михаил', 'Кузьменков', '+375447444040', '2025-11-17 07:51:11.538022', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (35, 530161843, 'lalejka', 'Alexandra', NULL, NULL, '2025-11-17 07:54:07.139480', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (36, 340123822, 'Olllliiii', 'Полховская', 'Ольга', '+375293220324', '2025-11-17 07:55:16.068697', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (37, 116157674, 'vrangeltv', 'Дмитрий', 'Врангель', '+375296727275', '2025-11-17 08:06:21.294512', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (38, 514316127, 'vmodzolevskiy', 'Модзолевский', 'Валентин', '+375444893606', '2025-11-17 08:16:13.716278', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (39, 311806808, 'Silent_Mariia', 'Mariia', 'Krasnova', NULL, '2025-11-17 08:31:57.559854', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (40, 599070957, 'u_the_green_light', 'Ника', 'Борбут', '+375447802724', '2025-11-17 09:52:52.592305', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (41, 1331069387, NULL, 'Victoria', 'Brumina', NULL, '2025-11-17 09:53:01.379535', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (42, 469407326, 'OlgaTAMA', 'Ольга', 'Тарасевич', '+375296148823', '2025-11-17 09:56:37.805294', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (43, 252587005, 'valentin_velichko', 'Валентин', 'Величко', '+375291153217', '2025-11-17 09:58:41.459187', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (44, 431092086, 'Tatiana_Ko8', 'Костюк', 'Татьяна', '+375296530578', '2025-11-17 10:28:51.249371', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (45, 471648929, NULL, 'Виктория', 'Лукьянчук', '+375295662399', '2025-11-17 10:59:37.141432', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (46, 8431846419, NULL, 'Алексей', 'Игнатовский', '+375295581967', '2025-11-17 11:21:54.936799', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (47, 523369276, 'Inna_Sapegina', 'Inna Sapegina', NULL, NULL, '2025-11-17 11:40:25.318119', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (48, 414424097, 'Ellioka', 'Ольга', 'Елисеева', '+375297501283', '2025-11-17 11:48:56.923714', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (49, 97612775, 'Sergom07', '𝙎𝙚𝙧𝙜𝙚𝙮 𝙈𝙖𝙠𝙤𝙫𝙨𝙠𝙮 ☮︎', NULL, NULL, '2025-11-17 11:54:32.123933', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (50, 97935842, 'caballojoven', 'Настя', 'Гончарова', '+375297632657', '2025-11-17 13:46:05.533857', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (51, 639535222, 'red_avocado', 'Red Avocado', NULL, NULL, '2025-11-17 13:56:07.240787', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (52, 797951331, 'valray_k', 'Кучинская', 'Валерия', '+375447569957', '2025-11-17 14:16:39.365744', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (53, 832918697, 'MariaSitkevich', 'Ситкевич', 'Мария', '+375297281550', '2025-11-17 14:18:44.118214', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (54, 960959447, 'DianaTelegram', 'Диана', 'Кулик', '+375298462087', '2025-11-17 14:24:02.961950', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (55, 959085182, 'AbramSnikers', 'Илья', 'Абрамович', '+375296174837', '2025-11-17 14:25:51.296387', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (56, 406845597, 'slavgoot', 'Вячеслав', 'Гутич', '+375298272446', '2025-11-17 14:34:14.792103', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (57, 5872667363, NULL, 'Рынкевич', 'Вадим', '+375297658583', '2025-11-17 15:27:59.411401', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (58, 316738008, 'AlexDiAlex', 'Дмитрий', 'Александров', '+375296225177', '2025-11-17 15:35:42.921961', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (59, 563545872, 'Alesia_2108', 'Павлович', 'Алеся', '+375447420254', '2025-11-17 15:49:18.714588', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (60, 1024506465, 'MalankaSpace', 'Марина', 'Лепешко', '+375295627462', '2025-11-17 15:54:56.386109', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (61, 802751548, NULL, 'Андрей', 'Можальский', '+375259050863', '2025-11-17 15:55:51.662036', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (62, 1018171754, 'valery1981', 'Валерий', 'Титов', '+3750296065340', '2025-11-17 15:58:42.884306', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (63, 263176568, 'Niktuz', 'Mikolai', 'Ischenko', '+375257406480', '2025-11-17 16:18:06.040294', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (64, 1137142673, 'MarySach', 'Mary', NULL, NULL, '2025-11-17 17:41:11.973979', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (65, 1695985251, 'Kostya_In_TG', 'Kostya', NULL, NULL, '2025-11-17 17:47:18.316675', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (66, 427702476, 'Julianna_Perelman', 'Юлия', 'Перельман', '+375296687800', '2025-11-18 07:15:03.653247', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (67, 5727387729, 'MaximS_888', 'Максим', 'Стулов', '+375291331515', '2025-11-18 07:32:19.035738', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (68, 375834942, 'karavaiav', 'Алексей', 'Каравай', '+375293166706', '2025-11-18 08:13:27.258497', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (69, 6418970518, 'Nadzeya_Dream', 'Надежда', 'Беднова', '+375293923498', '2025-11-18 09:54:07.039463', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (70, 787030032, 'LaraPod7', 'Лариса', 'Подгорная', '+375296582138', '2025-11-18 09:57:32.527635', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (71, 516706496, 'SamSebeAnton', 'Антон Авраменко 🎙 Ведущий мероприятий', NULL, NULL, '2025-11-18 10:45:09.994496', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (72, 427984383, 'TaniTim50', 'Татьяна', 'Тимощенко', '+375333025638', '2025-11-18 10:56:00.281199', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (73, 5160998281, NULL, 'Ерёменко', 'Татьяна', '+3750293698024', '2025-11-18 11:25:23.850114', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (74, 1127397377, 'stsefy', 'Ульяна', 'Стефанович', '+375292491906', '2025-11-18 11:27:49.869407', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (75, 6378523797, 'sergiusz12', 'Сергей', 'Савицкий', '+48731270861', '2025-11-18 11:29:13.406420', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (76, 435948288, 'vadimohka', 'Вадим', 'Владымцев', '+375444673946', '2025-11-18 11:49:37.849634', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (77, 199971265, NULL, 'Елена', 'Мурашко', '+375293845226', '2025-11-18 11:56:01.939354', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (78, 1307020225, 'Anastassia2511', 'Анастасия', 'Андриевская', '+375296561991', '2025-11-18 12:25:17.147560', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (79, 564505925, 'Dmitry_Ustimchuk', 'Дмитрий', 'Устимчук', '+375336411246', '2025-11-18 13:18:28.847911', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (80, 282252125, 'space_dandelion', 'Татьяна', 'Шепитько', '+375296747914', '2025-11-18 14:48:40.839240', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (81, 555655711, 'Leonik_Yu', 'Юлия', 'Леоник', '+375295705199', '2025-11-18 14:53:25.563374', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (82, 265727463, 'olegncv', 'Олег', 'Янцевич', '+375292565310', '2025-11-18 15:30:58.115029', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (83, 481544867, 'technodwarf', 'Влад', 'Коновалов', '+375447277736', '2025-11-18 15:39:54.941659', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (84, 553630385, 'sobolevskaya_92', 'Даша', 'Соболевская', NULL, '2025-11-19 08:11:47.458736', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (85, 1221724394, 'astrapaskevich', 'Анастасия', 'Паскевич', '+375295622188', '2025-11-19 08:38:48.640349', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (86, 5836152792, 'EnglishKrisstina', 'Кристина', 'Федорина', '+3750259171025', '2025-11-19 11:22:30.775073', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (87, 957492214, 'Lesya_Nav', 'Алеся', 'Наварко', '+375259395064', '2025-11-19 11:23:03.715531', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (88, 517634917, 'avymu', 'Вячеслав', 'Михеев', '+375295521745', '2025-11-19 11:24:45.803747', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (89, 682481192, 'tav_didi', 'Дмитрий', 'Тавлуй', '+375298295603', '2025-11-19 11:25:51.172021', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (90, 469645875, 'Yuliyasoul', 'Юлия', 'Симончик', '+375296731288', '2025-11-19 11:26:05.810584', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (91, 1045752640, 'nika_bogush', 'Вероника', 'Богуш', '+375298241126', '2025-11-19 11:26:32.259272', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (92, 222759017, 'remax1993', 'Виталий', 'Ширан', '+375292827173', '2025-11-19 11:26:42.404594', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (93, 979950043, 'towakiko', 'Илья', 'Маньковский', '+375295921635', '2025-11-19 11:28:01.311941', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (94, 586088326, 'tichon129', 'Александр', 'Тихон', '+375292909932', '2025-11-19 11:28:01.389224', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (95, 392997014, 'willkatarsis', 'Екатерина', 'Тарун', '+3750298665558', '2025-11-19 11:30:45.912409', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (96, 647546832, 'JLsunny', 'Юлия', 'Шахович', '+375295376453', '2025-11-19 11:31:49.814921', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (97, 467917836, 'FedorKazha', 'Фёдор', 'Кажа', '+375293433458', '2025-11-19 11:41:44.918204', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (98, 467424399, 'PeskoGalina', 'Галина', 'Песко', '+375296552595', '2025-11-19 11:43:01.968529', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (99, 483685544, 'Kat1eKat', 'Екатерина', 'Вышидкевич', '+375297741027', '2025-11-19 11:52:14.867580', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (100, 599884660, 'Vitali177', 'Виталий', 'Скрабатун', '+375336795015', '2025-11-19 11:53:05.124210', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (101, 117007842, 'Vasil556', 'Василий', 'Котов', '+375295686035', '2025-11-19 11:57:14.466328', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (102, 942157994, 'julia3254', 'Юлия', 'Довбыш', '+375293658834', '2025-11-19 12:06:08.289718', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (103, 705497900, 'ZhekaGrushevskiy', 'Грушевский', 'Евгений', '+375295237498', '2025-11-19 12:11:17.709908', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (104, 604864167, 'DianaPichugina', 'Диана', 'Пичугина', '+375296237896', '2025-11-19 12:13:29.698246', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (105, 5566417837, 'ArtaDIP', 'Jupiter', 'Pichugin', '+375295002500', '2025-11-19 12:15:25.445489', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (106, 330622983, 'lebowski_z', 'Dmitry', NULL, NULL, '2025-11-19 12:16:09.692432', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (107, 513995575, 'katemosse', 'Екатерина', 'Моссэ', '+375293220885', '2025-11-19 12:22:37.508936', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (108, 846388530, 'annafiad', 'Анна', 'Федорченко', '+375296093374', '2025-11-19 12:59:34.129788', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (109, 843013893, 'DzmitriM', 'Дмитрий', 'Мозовец', '+375296176689', '2025-11-19 13:04:29.015308', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (110, 405115685, 'Ulfahedin', 'Alexey', NULL, NULL, '2025-11-19 13:12:32.366672', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (111, 881774707, 'andrewvvvw', 'Андрей', 'Ишеков', '+375336969303', '2025-11-19 13:18:59.071357', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (112, 5295711379, 'inqua', 'Егор', 'Федосов', '+375259521298', '2025-11-19 13:35:43.195991', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (113, 821114146, 'Agentt_7_00', 'Надежда', 'Федькович', '+375297226320', '2025-11-19 14:44:23.132328', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (114, 707973128, 'kirichoar', 'Кирилл', 'Ефремов', '+375291942473', '2025-11-19 14:51:15.192633', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (115, 937184634, 'ssmlk_ww', 'Александра', 'Кручёнок', '+375291404211', '2025-11-19 16:10:50.823409', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (116, 968527633, 'kofigz', 'Иван', 'Комель', '+375333307432', '2025-11-19 17:14:34.791292', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (117, 455117329, 'aklevitov', 'Алексей', 'Клевитов', '+375293330013', '2025-11-19 18:12:03.705167', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (118, 416056312, 'OldKisel', 'Евгений', 'Кисель', '+375333620073', '2025-11-19 19:15:58.923328', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (119, 5251329796, NULL, 'Екатерина', NULL, NULL, '2025-11-20 06:10:33.788218', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (120, 409873719, 'Olgasheresh', 'Ольга', 'Шереш', '+375293805590', '2025-11-20 07:03:50.084457', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (121, 811287610, 'eleonora_gru', 'Элеонора', 'Грушевская', '+375445608909', '2025-11-20 09:48:06.501764', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (122, 869313275, 'liqut_tiu', 'Дмитрий', 'Мороз', '+375333814125', '2025-11-20 10:15:33.327859', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (123, 254255893, 'kiryl2005', 'Кирилл', 'Михайловский', '+375296560623', '2025-11-20 11:21:27.989100', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (124, 368015658, 'nevelite', 'Евгений', 'Шкляревский', '+375336985740', '2025-11-20 11:25:31.118377', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (125, 5616486948, 'padzei', 'Vadzim Suhak', NULL, NULL, '2025-11-20 11:28:38.866814', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (126, 1965424274, 'taras_servolux', 'Тарас', 'Кирильченко', '+375297472457', '2025-11-20 12:03:06.341171', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (127, 388525267, 'irenkami', 'Литвинко', 'Ирина', '+375293254121', '2025-11-20 15:06:17.899913', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (128, 421692337, 'RoggeSkog', 'Yegor', 'Kuzmin', '+375447729719', '2025-11-20 17:06:42.329651', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (129, 539214234, 'vikigolubeva', 'Виктория', 'Безнощенко', '+375297345682', '2025-11-20 22:21:39.147641', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (130, 977904414, 'Mil_a111', 'Людмила', 'Кушнир', '+375336869169', '2025-11-21 07:43:03.815978', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (131, 673129644, 'SQflex', 'Егор', 'Голубев', '+375447387513', '2025-11-21 07:54:43.379067', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (132, 343591503, 'AnnaKuharchik', 'Аня', 'Дьякова', '+375445386786', '2025-11-21 10:37:46.909501', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (133, 860032617, 'julietta7', 'Юлия', '🔸Туры.✈️SMM.Маркетинг 🌪️', NULL, '2025-11-21 14:42:22.910296', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (134, 131124067, 'YanKobzev', 'Yan', 'Kobzev', NULL, '2025-11-21 14:42:22.918129', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (135, 636168342, 'midnaix', 'Максим', 'Черный', '+375336680676', '2025-11-21 14:42:22.920340', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (136, 773413714, NULL, 'Вадим', 'Гарасюк', '+375291298641', '2025-11-21 14:42:22.949660', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (137, 852629140, 'Elenajukh', 'Елена', 'Джух', '+375297817114', '2025-11-21 15:56:07.882531', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (138, 1289328059, 'GushaJu', 'Лия', 'Л', '+375123456789', '2025-11-21 16:16:24.941969', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (139, 1019364809, 'jsvod', 'Артём', NULL, NULL, '2025-11-21 16:17:03.352922', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (140, 984188498, NULL, 'Назар', 'Алейников', '+375295478255', '2025-11-21 16:19:16.723218', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (141, 6570083707, 'HeII_Scream', 'Павел', 'Дракель', '+375291407974', '2025-11-21 16:19:17.253306', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (142, 1245395745, 'gerych_siu', 'Троско', 'Герман', '+375295141861', '2025-11-21 16:20:01.850953', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (143, 1171257202, 'diankash_22', 'Диана', 'Шавельская', '+375333401450', '2025-11-21 16:20:06.577149', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (144, 8214131721, 'Andrey_Anatolevich99', 'Андрей', 'Анатолевич', '+375298618956', '2025-11-21 16:22:07.832347', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (145, 576721787, 'AnnaKarkanitsa', 'Анна', 'Карканица', '+375293209908', '2025-11-21 16:22:12.846244', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (146, 831476958, 'wert3x', 'Владислав', 'Козел', '+375336679188', '2025-11-21 16:22:36.862704', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (147, 1315380151, NULL, 'Андрей', 'Проневич', '+375295874819', '2025-11-21 16:23:31.440919', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (148, 839206939, 'vania_jj', 'Иван', 'Шершень', '+375336867787', '2025-11-21 16:24:23.963464', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (149, 572264612, NULL, 'Тимофей', 'Гейба', '+375295357933', '2025-11-22 08:22:36.259307', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (150, 680491505, 'vpeshkoo', 'Иван', 'Пешко', '+375333777000', '2025-11-22 08:24:01.139220', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (151, 5023003261, 'Loki2288333', 'Илья', 'Коншин', '+375259598633', '2025-11-22 10:15:46.813954', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (152, 960421692, 'yan_ax', 'Яна', 'Ковкель', '+375333780874', '2025-11-22 10:15:46.831186', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (153, 6148303498, 'Merry_077', 'Мисник', 'Марина Владимировна', '+375297818051', '2025-11-22 10:27:46.051550', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (154, 5488178395, 'KateM2211', 'Мисник', 'Екатерина', '+375333779987', '2025-11-22 10:31:29.389390', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (155, 5609117794, 'Lomi22880', 'Лохницкий', 'Михаил', '+375295985089', '2025-11-22 10:47:48.066452', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (156, 887075959, 'katherine_ihm', 'Екатерина', 'Дубровщик', '+375336866658', '2025-11-22 11:14:38.426119', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (157, 6502305475, 'pa_volha', 'Ольга', 'Полуйчик', '+375297807832', '2025-11-22 11:22:20.734346', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (158, 514496583, 'Alla3000', 'Елена', 'Банюкевич', '+375336552925', '2025-11-22 11:50:23.726915', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (159, 1829887142, 'NadzeyaShyvilko', 'Надежда', 'Шивилько', '+375291531015', '2025-11-22 11:53:34.427283', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (160, 1080675926, 'absensu', 'Евгений', 'Дашкевич', '+375336724571', '2025-11-22 11:56:01.358214', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (161, 7537115942, NULL, 'Ольга', 'Назарова', '+375295860370', '2025-11-22 11:56:46.838005', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (162, 622555121, 'tnadejdaa', 'Надежда', 'Трофимова', '+375296065724', '2025-11-22 13:02:49.763083', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (163, 1948359815, 'OptusG', 'Курило', 'Сергей', '+375292828854', '2025-11-22 15:14:22.632794', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (164, 903458205, 'SAVA_96_99', 'Федор', 'Торгонский', '+375292331310', '2025-11-22 17:55:48.094775', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (165, 1353437826, 'maximisachenko', 'Максим', 'Исаченко', '+375295412057', '2025-11-22 18:15:48.702127', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (166, 1921394079, 'viiweer', 'Виктория', 'Васецкая', '+375333870409', '2025-11-22 19:11:25.902842', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (167, 747847192, 'lizabethsysko', 'liza', NULL, NULL, '2025-11-22 19:18:48.660587', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (168, 6225785237, NULL, 'Дмитрий', 'К', '+375297888136', '2025-11-22 19:38:34.219640', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (169, 1234913982, 'Igor_kovaleuski', 'Игорь', 'Ковалевский', '+375295871438', '2025-11-23 10:01:03.564348', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (170, 893453337, 'alinavoloha', 'Алина', 'Волоха', '+375291245114', '2025-11-23 12:10:09.697739', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (171, 991572569, 'NadinBes', 'Надежда', 'Бессчетнова', NULL, '2025-11-23 13:04:07.380296', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (172, 1633426750, NULL, 'Оксана', 'Гейба', NULL, '2025-11-23 13:17:07.782651', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (173, 193400012, 'lerik988', 'Валерий', 'Передков', '+375292836963', '2025-11-24 08:20:07.482637', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (174, 447241621, 'xxrumz', 'Максим', 'Рудь', '+375298819442', '2025-11-24 08:51:41.678229', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (175, 486996711, 'nastya_semai', 'Anastasiya', 'Semeniuk', NULL, '2025-11-25 14:51:59.092745', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (176, 511590178, 'grinko_vr', 'Валерий', 'Гринько', NULL, '2025-11-25 14:51:59.094957', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (177, 489138767, 'TGFpbg', 'Максим', 'Мушинский', '+375295661657', '2025-11-25 14:51:59.096065', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (178, 432815173, 'emwikky', 'Виктория', 'Базылюк', '+375291287103', '2025-11-25 14:51:59.094378', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (179, 445486151, 'yfzzzzz', 'Кирилл', 'Молодой', '+375298427036', '2025-11-25 14:51:59.092292', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (180, 1910441910, 'Roman1234_4321', 'Сергеев', 'Роман', '+375447027117', '2025-11-25 14:51:59.093078', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (181, 5711009298, NULL, 'K S', NULL, NULL, '2025-11-25 14:51:59.092924', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (182, 393437056, 'nickbun', 'Николай | бизнес-планы | финмодели', NULL, NULL, '2025-11-25 14:51:59.094714', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (183, 958952745, 'Naayzzi', 'Диана', 'Василевская', '+375333934591', '2025-11-25 14:51:59.096269', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (184, 1414721913, 'martawelll', 'Марта', 'Циток', '+375298050377', '2025-11-25 14:51:59.095435', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (185, 332292350, 'oleg_ishchenko30', 'Oleg', 'Ishchenko', '+375299780431', '2025-11-25 14:53:01.110963', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (186, 576800885, 'alesiahil', 'Алеся', 'Гиль', '+375292567964', '2025-11-25 15:33:04.767586', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (187, 940732417, 'juliabakai6', 'Юлия', 'Бакай', '+375295363050', '2025-11-25 15:45:39.048842', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (188, 541952119, 'vazniak_vadzim', 'Вадим', 'Возняк', '+375333907973', '2025-11-25 16:06:51.062035', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (189, 827553675, 'nblues', 'Ирина', 'Григорьева', '+00000000000', '2025-11-25 17:00:39.357429', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (190, 221018376, 'nphomo', 'Наталья', 'Пацей', '+375291389145', '2025-11-26 07:04:45.173451', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (191, 930516811, 'AAK_90', 'Андрей', 'Кухоренко', '+375333083202', '2025-11-26 07:04:45.171957', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (192, 676067555, 'anny_tse', 'Анна', 'Янулевич', '+375298359850', '2025-11-26 07:04:45.176195', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (193, 8568338826, 'max_syry', 'Сырица', 'Максим', '+995558793767', '2025-11-26 07:04:45.169357', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (194, 283370272, 'AnnaVitko', 'Анна', 'Витко', '+375298993975', '2025-11-26 07:04:45.176587', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (195, 5152544004, 'TDFS88', 'Владимир', 'Махнач', '+375295603538', '2025-11-26 07:04:45.171732', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (196, 1484350677, 'bea1k', 'Максим', 'Троско', '+375292753428', '2025-11-26 07:04:45.170313', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (197, 800734172, 'Helga_dm', 'Helga', NULL, NULL, '2025-11-26 07:04:45.176428', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (198, 7498873049, 'KETTU_787', '@Kettu_787', NULL, NULL, '2025-11-26 07:04:45.176959', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (199, 8368103582, NULL, 'Даниил', 'Чуянов', '+375333855931', '2025-11-26 07:04:45.172553', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (200, 912566660, 'volha1301', 'Ольга', 'Чуянова', '+375292133308', '2025-11-26 07:04:45.173777', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (201, 539373047, 'Astoria76', 'Ирина', 'Борбут', '+375447258859', '2025-11-26 07:04:45.169969', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (202, 387151974, 'anastasia_yak23', 'Анастасия', 'Копанева', '+375333869831', '2025-11-26 07:04:45.170857', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (203, 1607896362, 'mynameis_Adam', 'Адам', 'Шостак', '+375293971124', '2025-11-26 07:04:45.171200', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (204, 428805479, 'MariaCareerAdvisor', 'Корочкина', 'Мария', '+375293410750', '2025-11-26 07:04:45.171585', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (205, 7314153054, 'hrai_by', 'Никита', 'карпук', '+375292944545', '2025-11-26 07:04:45.172401', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (206, 5901087367, NULL, 'Шостак', 'Юлия', '+375291800943', '2025-11-26 07:13:58.782487', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (207, 954470687, NULL, 'Игорь', 'Притуленко', '+375257600713', '2025-11-26 07:19:27.946759', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (208, 798952230, 'olga_tochkina', 'Точкина', 'Ольга Эдуардовна', '+375447100802', '2025-11-26 07:19:52.344867', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (209, 577368613, 'Viktoryia_Varvashevich', 'Виктория', 'Варвашевич', '+375292721819', '2025-11-26 07:22:29.492425', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (210, 426330199, 'tae_ate', 'Антон', 'Тузенко', '+375297053073', '2025-11-26 07:30:10.190112', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (211, 746039462, 'Elena_Hotko', 'Елена', 'Хотько', '+375295977340', '2025-11-26 08:03:58.302553', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (212, 594667027, 'Valery_Stl', 'Столяров', 'Валерий', '+375291466783', '2025-11-26 08:11:31.937155', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (213, 541072287, 'mxslv', 'Мария', 'Харкович', '+375297013345', '2025-11-26 08:40:35.225941', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (214, 483356528, 'ulianasavchukk', 'Ульяна', 'Савчук', '+375292279794', '2025-11-26 08:47:03.944436', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (215, 1459609586, 'Marialavre', 'Лаврецкая', 'Мария', '+375291673464', '2025-11-26 08:47:34.324741', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (216, 478224025, 'polina_gukova', 'Полина', 'Гукова', '+375291804387', '2025-11-26 09:07:15.293392', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (217, 675788879, 'Linakuklova', 'Лена', 'Куклова', '+375292700674', '2025-11-26 09:07:39.570626', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (218, 887295484, 'PeaseD', 'Гуков', 'Павел Витальевич', '+375333744815', '2025-11-26 09:09:15.872935', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (219, 585449667, 'chirkoed', 'Илья', 'Чирко', '+375447679684', '2025-11-26 10:22:40.722948', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (220, 1016948287, NULL, 'Дарий', 'Домбровский', '+375298869964', '2025-11-26 11:18:38.789587', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (221, 382962623, 'AnastasiyaZaloga', 'Минько', 'Анастасия', '+375272802959', '2025-11-26 12:55:18.329765', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (222, 1212612830, 'AviatorMAV', 'Александр', 'Мудрик', '+375447803856', '2025-11-26 15:30:01.479865', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (223, 933705493, 'Laman_Elena', 'Elena', NULL, NULL, '2025-11-26 15:30:01.481157', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (224, 1005399941, 'Alenka4116', 'Елена', NULL, NULL, '2025-11-26 15:30:01.480991', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (225, 5522452880, 'andre_fox81', 'Андрей', 'Сивый', '+375445859749', '2025-11-26 16:24:26.356525', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (226, 417663903, 'olegussss', 'Олег', 'Зелинский', '+375291066531', '2025-11-26 16:50:05.531028', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (227, 457286248, 'OKunitskaya', 'Ольга', 'Куницкая', '+375297565654', '2025-11-26 16:58:54.710130', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (228, 822103418, NULL, 'Ирина', NULL, NULL, '2025-11-26 16:58:54.711107', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (229, 1050498492, 'viktoria_uni', 'Виктория', 'Грибовская', NULL, '2025-11-26 16:58:54.711388', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (230, 402019980, 'hr_Annny', 'Анна', 'Говор', '+375291074471', '2025-11-26 16:58:54.710369', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (231, 435866765, 'katyadubina', 'Дубина', 'Катя', '+375295298428', '2025-11-26 17:00:53.853811', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (232, 354270799, 'anna_naumenkohrpr', 'Анна', 'Науменко', '+375447139339', '2025-11-26 17:13:20.667272', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (233, 544957958, 'Eirene_Rybakova', 'Ирина', 'Рыбакова', '+375291885947', '2025-11-26 17:20:50.163002', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (234, 5237254176, 'LoNeR_ins', 'Влад', 'Пильковский', '+375336967073', '2025-11-26 18:13:37.214007', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (235, 7826957802, 'terekhovalinaa', 'Alina', 'Terekhova', '+375297863846', '2025-11-26 18:47:39.193045', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (236, 769689948, 'Olga_zh30', 'Ольга', 'Жигментович', '+375297026906', '2025-11-26 18:47:58.827300', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (237, 898319596, 'poyasokolga', 'Ольга', 'Поясок', '+375291899127', '2025-11-26 18:50:02.654009', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (238, 1172766523, 'ps_andreenko', 'polina andreenko', NULL, NULL, '2025-11-26 18:50:08.393833', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (239, 666449093, 'yoouver', 'Номер', 'телефона, как ты и просил', '+375292105741', '2025-11-26 18:54:10.253821', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (240, 1339650965, 'naddy_sokl', 'Надежда', 'Соколова', '+375297552731', '2025-11-26 19:05:22.655089', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (241, 335114438, 'Nastassia_Marozava', 'Анастасия', 'Морозова', '+375447344547', '2025-11-26 19:18:20.517584', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (242, 2133430603, 'luxanima', 'Ольга', 'Козодой', '+375293699275', '2025-11-26 19:22:59.601096', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (243, 792114030, 'ludmilavs89', 'Ludmila', NULL, NULL, '2025-11-26 19:23:32.010957', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (244, 928473406, 'andrey_zahar96', 'Андрей', 'Захарченко', '+375333491267', '2025-11-26 19:45:50.177095', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (245, 1699887531, 'vdmpsss', 'вадим', NULL, NULL, '2025-11-26 19:47:38.390869', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (246, 917739449, 'NonkaG', 'Нона', 'Григорян', '+375296998839', '2025-11-26 19:50:02.511621', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (247, 807211052, 'MaksimEntity', 'Максим', 'Кучук', '+375295737035', '2025-11-26 21:56:00.876781', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (248, 5086963535, 'olnakav', 'ОЛЬГА', 'Бинкевич', '+375297834681', '2025-11-27 05:36:00.998318', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (249, 5162008977, 'ValentinaStarostina', 'Валентина', 'Старостина', '+375298857334', '2025-11-27 05:43:25.617011', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (250, 861857197, 'happy_start_2019', 'Александр', 'Цидик', '+375298861989', '2025-11-27 05:46:01.296308', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (251, 5297158108, NULL, 'Renata', 'Renata', NULL, '2025-11-27 05:48:15.897310', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (252, 1760518723, 'CvL778', 'Александра', NULL, NULL, '2025-11-27 05:54:23.129089', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (253, 413479566, 'grantutick', 'Татьяна', 'Гранковская', '+375291443385', '2025-11-27 06:05:35.183628', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (254, 643986753, 'Elena_Napolskikh', 'Елена', 'Напольских', '+375292898122', '2025-11-27 06:31:51.420093', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (255, 128986040, 'Vadbes', 'Vadim', NULL, NULL, '2025-11-27 06:32:41.731174', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (256, 267935572, 'OksyKoks', 'Оксана', 'Хачиян', '+375297776661', '2025-11-27 06:36:06.099993', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (257, 567011591, 'oh_darya1', 'Дарья', 'Цынгалёва', '+375333366145', '2025-11-27 06:52:43.627458', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (258, 1884737592, NULL, 'Артем', 'Ефимов', '+375293635735', '2025-11-27 06:55:46.270793', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (259, 833585773, 'PresnakovaOksana', 'Оксана', 'Преснакова', '+375447979250', '2025-11-27 06:59:43.037426', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (260, 478571805, NULL, 'Наталия', 'Шманькова', '+375445738885', '2025-11-27 07:14:07.366019', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (261, 773501377, 'skausn', 'Александра', 'Кунцевич', '+375333065629', '2025-11-27 07:39:32.544135', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (262, 644278962, 'vatrosh', 'Имя:', 'Валентин Фамилия: Бавтрош', '+375295860261', '2025-11-27 07:43:43.219479', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (263, 1441579586, 'kvitness', 'вероника', NULL, NULL, '2025-11-27 07:44:21.626624', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (264, 6794385338, 'anastejsha5', 'Анастасия', 'Якимович', '+375333167459', '2025-11-27 08:29:14.560771', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (265, 1063433638, 'nasstassyam', 'Анастасия', 'Мартысюк', '+375333203810', '2025-11-27 08:36:14.343192', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (266, 1765200280, 'yrrmolich', 'Надежда', 'Ярмолич', '+375447234860', '2025-11-27 08:38:51.895240', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (267, 872190166, 'VolhaVill', 'Хочу', 'зарегистрировать', '+375293816361', '2025-11-27 08:39:40.966761', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (268, 56217824, 'KseniyaPdM', 'Kseniya 💙', NULL, NULL, '2025-11-27 08:41:10.699939', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (269, 502152131, 'Elena15828', 'Елена', 'Трафимчик', '+375292880972', '2025-11-27 08:55:44.102566', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (270, 646395134, 'andreilomakindev', 'Андрей', 'Ломакин', '+375295208881', '2025-11-27 09:02:23.887138', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (271, 7416070755, 'alinafrancuzova', 'Алина', 'Французова', '+375336506733', '2025-11-27 09:08:07.089030', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (272, 6091026715, 'daryavogue', 'Дарья', 'Лойко', '+375297267436', '2025-11-27 09:11:02.415439', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (273, 1610979012, 'claire_andree', 'Светлана', 'Андреева', '+375447698674', '2025-11-27 09:58:37.553305', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (274, 912118268, 'vaveyko', 'Иван', 'Захвей', '+375299809929', '2025-11-27 10:01:03.428495', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (275, 1439991134, 'Snopko_Kate', 'Snopko', 'Ekaterina', NULL, '2025-11-27 11:05:17.725989', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (276, 473778896, 'vezhelek', 'Ivan', 'Vezhal', NULL, '2025-11-27 11:32:01.007004', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (277, 776864180, 'tatsianakostina_coach', 'Татьяна', 'Костина', NULL, '2025-11-27 11:39:15.349545', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (278, 568035258, 'Anaralikanastasiya', 'Anastasia', 'Anaralik', NULL, '2025-11-27 11:47:25.902249', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (279, 925354261, 'netynika335', 'Максим', 'Козейко', '+375333454133', '2025-11-27 12:04:30.200969', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (280, 621699693, 'Aiza666777', 'Наталья', 'Дьякова', '+375291547244', '2025-11-27 12:39:50.466668', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (281, 1170591044, 'midland79', 'Александр', 'Ганисевский', '+375333910966', '2025-11-27 13:18:47.619857', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (282, 391589436, 'poostotel', 'Александр', 'Михнюк', '+375444765694', '2025-11-27 13:20:32.358143', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (283, 5854250345, 'ksenkssaa', 'Яник', 'Ксения', '+375296688104', '2025-11-27 13:22:29.277826', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (284, 648461789, 'iwntonlyu', 'Илья', NULL, NULL, '2025-11-27 13:52:15.987952', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (285, 472041471, 'Natalia_Krupitsa', 'Natalia', 'Krupitsa', NULL, '2025-11-27 14:18:36.009358', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (286, 627958193, 'sashunyak', 'Александра', 'Коток', '+375339015363', '2025-11-27 16:25:54.510024', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (287, 6120213263, 'krittixin', 'Карина', 'Поплавская', '+375447315640', '2025-11-27 16:42:41.108191', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (288, 5133822375, 'Justy55', 'Милана', 'Иванова', '+3750291234567', '2025-11-27 16:54:13.942698', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (289, 1887182320, 'Mefl15', 'Артём', 'Мавчун', '+375255405690', '2025-11-27 17:08:35.078283', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (290, 771374920, 'yanakhudoley', 'Yana', 'Khudoley', NULL, '2025-11-27 17:24:36.443064', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (291, 613290784, 'pepelishka', 'я', 'написала свое имя и фамилию для регистрации на мероприятие', '+375296794010', '2025-11-27 17:28:41.506332', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (292, 476059319, 'irishka_12345', 'Ирина', NULL, NULL, '2025-11-27 18:19:36.030512', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (293, 29417583, NULL, 'Виктория', 'Далинник', '+375297667804', '2025-11-27 18:24:46.155135', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (294, 5165632291, 'almost6666', 'Никита', NULL, NULL, '2025-11-27 19:15:10.899537', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (295, 717880705, 'mx_veselkov', 'Max', 'V.', '+375333013026', '2025-11-27 22:00:43.305458', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (296, 1961813553, 'propanorm', 'Александр', 'Лавринович', '+375297677462', '2025-11-27 22:07:49.608203', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (297, 1336715887, NULL, 'Евгений', 'Шевченко', '+375295898435', '2025-11-28 05:14:03.464985', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (298, 765637498, 'tat_belozerova', 'Tatsiana', 'Belozerova', NULL, '2025-11-28 05:35:23.033923', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (299, 1059021006, NULL, 'Olga', NULL, NULL, '2025-11-28 05:40:07.508559', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (300, 691892219, 'doppler_the_greatest', 'Eugene', 'Bagenski', NULL, '2025-11-28 09:58:28.823260', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (301, 6574856429, 'nickJAW', 'Никита', 'Кошев', '+375298848248', '2025-11-28 11:17:53.304962', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (302, 1937516457, 'AlekseySyr', 'Алексей', NULL, NULL, '2025-11-29 19:14:03.573922', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (303, 5098417726, 'KSph_x', 'Фио', 'раньше уже указала', '+375296272319', '2025-11-29 20:27:14.514590', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (304, 1228210993, 'Anthoniobanderas', 'Tosha', NULL, NULL, '2025-11-30 08:15:57.841261', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (305, 637386418, 'NPetlitska', 'Надя Цвирко, автор и ведущая ютуб-канала "Финансовый интеллект"', NULL, NULL, '2025-11-30 09:14:33.036338', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (306, 1604362586, 'dm_vdovin', 'Дмитрий', 'Вдовин', '+375297076151', '2025-11-30 10:50:31.785210', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (307, 726647578, 'andrey_rutk', 'Андрей', 'Рутковский', '+375293032604', '2025-11-30 12:18:23.626060', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (308, 443404930, 'kvoinilovich', 'Кристина', 'Войнилович', '+375333173817', '2025-11-30 12:42:21.770515', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (309, 1068238434, 'marina_aesera', 'Марина', 'Осипчик', NULL, '2025-11-30 14:22:38.441623', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (310, 911591246, NULL, 'Наталья', NULL, NULL, '2025-11-30 18:31:08.920255', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (311, 463256571, 'milkovskaya_ann', 'Анна', 'Мильковская', '+375296153520', '2025-12-01 11:12:06.317105', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (312, 545520653, 'margotiko', 'Маргарита', NULL, NULL, '2025-12-02 09:15:00.054774', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (313, 747239327, 'AllaPetukhovich', 'Алла', 'Петухович', '+375296269474', '2025-12-02 11:32:04.358562', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (314, 210696231, 'viachaslau68', 'Вячеслав', 'Зенькович', NULL, '2025-12-02 12:40:04.606970', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (315, 9000000001, 'mamaeremi', 'Ульяна', 'Прусак', '375291674971', '2025-12-02 15:44:59.850601', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (316, 9000000002, 'valeryan_brunin', 'Валерьян', 'Брунин', '375297619370', '2025-12-02 15:44:59.851248', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (317, 9000000003, NULL, 'Владислав', 'Койдановский', '375296767777', '2025-12-02 15:44:59.851275', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (318, 9000000004, 'lisana333', 'Анастасия', 'Прищепова', '375291988009', '2025-12-02 15:44:59.851310', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (319, 9000000005, 'pjff', 'Егор', 'Крячев', '375291594005', '2025-12-02 15:44:59.851329', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (320, 9000000006, 'aishaallazova', 'Айша', 'Аллазова', '375256903953', '2025-12-02 15:44:59.851347', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (321, 9000000007, NULL, 'Владислав', 'Койдановский', '375296767777', '2025-12-02 15:48:17.370476', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (322, 539733525, 'markevichanasta', 'Анастасия', 'Маркевич', NULL, '2025-12-02 15:53:53.052127', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (323, 5995977948, 'ipadkkid', 'никитка', NULL, NULL, '2025-12-11 07:06:05.738941', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (324, 7942566957, 'Yury_blockchain', 'Юрий', 'Соломахо', '+375293196311', '2025-12-11 09:10:01.075374', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (325, 1020091808, 'olgabobrovnitskay', 'Ольга', 'Бобровницкая', '+375339925732', '2025-12-11 14:14:32.591282', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (326, 326953711, 'a01_user', 'Александр', 'Сазонов', '+375292185438', '2025-12-11 19:32:46.989590', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (327, 1645302502, 'bvlkr', 'Буλавин', NULL, NULL, '2025-12-11 20:49:06.028816', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (328, 8562745319, 'vitalibakhmat', 'Vitali', 'Bakhmat', NULL, '2025-12-11 21:28:38.466771', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (329, 637572823, 'Sta1er', 'Владислав', NULL, NULL, '2025-12-12 06:47:28.860304', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (330, 866395600, NULL, 'Артур', 'Скобля', '+375291117129', '2025-12-12 07:23:10.480649', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (331, 483198996, 'Lucefer1907', 'Юрий', NULL, NULL, '2025-12-12 08:18:22.276364', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (332, 781590318, 'anyadonuts', 'Анна', 'Драгун', '+375292584554', '2025-12-12 08:18:49.758162', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (333, 487113336, 'OlgaKn_7', 'Князюк', 'Ольга', '+375447400636', '2025-12-12 09:00:52.918905', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (334, 276350191, 'vladlibe', 'Мешечко', 'Владимир', '+375296539515', '2025-12-12 09:07:52.565566', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (335, 888422576, 'Anastasia_11002', 'Кислая', 'Анастасия', '+375333362638', '2025-12-12 09:09:12.853027', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (336, 308922118, 'Artyom_Trifonov', 'Артём', 'Трифонов', '+375336848520', '2025-12-12 09:28:34.884148', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (337, 7254108623, 'skakun_diana', 'Диана Скакун', NULL, NULL, '2025-12-12 10:03:09.929531', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (338, 1160537632, 'dziyanasentsemava', 'Диана', 'Сентемова', '+375291531713', '2025-12-12 10:08:08.991134', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (339, 200544829, 'Ne_Nechaev', 'Ne.Nechaev', NULL, NULL, '2025-12-12 10:18:37.990245', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (340, 971127555, 'jamaisvita', 'Екатерина', 'Кондратьева', '+3750447719230', '2025-12-12 10:47:32.355949', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (341, 500177016, 'vivamariami', 'Мария', 'Мармузевич', '+375292397969', '2025-12-12 10:47:49.974741', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (342, 6341098567, 'Ksenia_7419', 'Оксана', 'Новицкая', '+3750255196734', '2025-12-12 10:48:19.192719', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (343, 1199391272, 'daryaloban', 'Darya', 'Loban', '+48796932354', '2025-12-12 10:52:36.365690', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (344, 663413654, 'AnastasiyaTrifonova', 'Анастасия', 'Трифонова', '+375298651535', '2025-12-12 10:55:09.663958', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (345, 668273870, 'qwerty_4443', 'Неборский', 'Андрей', '+375336628313', '2025-12-12 10:57:58.100050', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (346, 6562227944, 'alena_tsurik', 'Цурик', 'Елена Петровна', '+375296262123', '2025-12-12 11:02:10.964788', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (347, 76467239, 'Al111777', 'Шишков', 'Максим', '+375297111777', '2025-12-12 11:27:14.553668', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (348, 920514243, 'ddanhavedone', 'Дарья', 'Данилова', '+16574569699', '2025-12-12 11:31:21.624575', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (349, 986738998, 'kahannee', 'Дзивнель', 'Марта', '+375336709442', '2025-12-12 11:41:04.718271', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (350, 898142036, 'eismontvioletta', 'Виолетта', 'Эйсмонт', '+375298803645', '2025-12-12 12:04:06.607467', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (351, 924677682, 'qdanab', 'Дана', 'Черноус', '+375292428728', '2025-12-12 12:04:40.337275', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (352, 7399136363, 'vit_ska', 'Виталина', 'Беляковская', '+375447699324', '2025-12-12 12:05:26.455680', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (353, 1511233009, 'Bogdidu', 'Bogdań', NULL, NULL, '2025-12-12 12:06:33.607568', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (354, 797941976, 'Zbzhi', 'Виолетта', 'Замбжицкая', '+375296088003', '2025-12-12 12:07:20.033709', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (355, 1136340999, 'cher_nastik', 'Анастасия', 'Чернобаева', '+375336360484', '2025-12-12 13:04:36.861257', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (356, 409064276, 'StockTradeAlert25', 'Валерий Дайнеко', NULL, NULL, '2025-12-12 13:59:21.688254', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (357, 8302587804, 'maincomby_bot', 'M.AI.N - Admin Bot', NULL, NULL, '2025-12-12 18:41:00.992304', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (358, 468819032, 'ppc_amazon', 'Ангелина', 'Мисевич', '+375298380443', '2025-12-12 20:47:42.640321', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (359, 512269243, 'margarita_080', 'Маргарита', 'Коноплич', '+375298217416', '2025-12-12 20:48:52.243415', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (360, 1262849026, 'OlgaBoiko23', 'Olga', 'B. 🪩', NULL, '2025-12-13 04:36:51.951349', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (361, 240290806, 'Kat_Sia_ryna', 'Katsiaryna', 'Stryhina', NULL, '2025-12-13 07:28:05.719829', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (362, 701992731, 'natatata123', 'Natalia', NULL, NULL, '2025-12-13 08:38:28.312274', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (363, 697140767, 'AlissiyonokAlexander', 'Александр', 'Алисиёнок', NULL, '2025-12-13 08:38:28.315370', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (364, 761411849, 'ljudotschka', 'Людмила Светличная/коуч по немецкому языку для карьеры', '@superdeutsch_mit_ludmila', NULL, '2025-12-13 08:38:28.313632', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (365, 5521498172, 'lYafetl', 'Yafet', NULL, NULL, '2025-12-13 08:38:28.311364', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (366, 7865884699, 'Cyberprotos', 'Protos', NULL, NULL, '2025-12-13 08:38:28.313144', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (367, 5875775078, 'wandererlex', 'Алексей', 'Гарбар', '+48789626540', '2025-12-13 08:38:28.313832', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (368, 1348229126, 'olgazhmailik_psychologist', 'Olga', 'Zhmailik', NULL, '2025-12-13 08:38:28.311122', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (369, 1062700215, 'exception_error', 'Фёдор', 'Никончук', '+375292403083', '2025-12-13 08:40:50.395156', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (370, 668268826, 'andrew_tt', 'Andrew', NULL, NULL, '2025-12-13 08:49:53.944284', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (371, 1289040369, 'khill_killl', 'илья', NULL, NULL, '2025-12-13 09:18:11.180380', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (372, 984239997, 'lisana333', 'Anastasiya', NULL, NULL, '2025-12-13 09:22:29.158943', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (373, 7227863362, 'seeqwe', 'артём', NULL, NULL, '2025-12-13 09:37:32.965572', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (374, 5895274376, NULL, 'D', NULL, NULL, '2025-12-13 09:37:32.965082', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (375, 814483085, 'takispadar', 'Максим', 'Вилькоцкий', '+375293614447', '2025-12-13 09:55:44.654768', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (376, 7025692964, 'Michael_Leshchenko', 'Михаил', 'Лещенко', '+375295509727', '2025-12-13 10:00:55.726950', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (377, 763248923, 'pancatva', 'Cтacя', NULL, NULL, '2025-12-13 10:01:01.671223', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (378, 473782628, 'westpunk', 'Ilya westpunk', NULL, NULL, '2025-12-13 10:01:05.342832', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (379, 383188182, 'Nike_Minsk', 'Nikita', 'Makarevich', NULL, '2025-12-13 10:01:14.624655', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (380, 453853018, 'Psiholog_Ersoy', 'Елена', 'Ерсой', NULL, '2025-12-13 10:01:40.641113', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (381, 394636966, 'maksimowwo', 'Максим', 'Потапнёв', '+375291936534', '2025-12-13 10:01:45.127825', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (382, 755390820, 'rersoy', 'Recep', 'Ersoy', NULL, '2025-12-13 10:02:21.865073', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (383, 995199844, 'NORMIR_MOSAIC', 'В И К Т О Р', NULL, NULL, '2025-12-13 11:43:21.875417', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (384, 1189193695, 'olya_p2', 'Ольга', 'Пашкович', '+375293835534', '2025-12-13 11:43:21.879538', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (385, 895783918, 'zero_058', 'Evgen', NULL, NULL, '2025-12-13 11:43:21.878260', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (386, 507543235, 'kremzil', 'kremzil', NULL, NULL, '2025-12-13 11:43:21.875936', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (387, 1284120576, NULL, 'Шура', 'Шура', NULL, '2025-12-13 11:43:21.879722', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (388, 5057643909, 'Oleg_Sk_AR', 'Олег', 'Скобей', '+375259767754', '2025-12-13 11:43:21.879958', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (389, 121689637, 'mcsarajevo', 'And', NULL, NULL, '2025-12-13 11:43:21.877982', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (390, 429008074, 'Rodionow1', 'Alexander', NULL, NULL, '2025-12-13 11:43:21.880114', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (391, 553848946, 'konstanpro', 'Konstantin', 'Pronkin', NULL, '2025-12-13 12:52:34.307898', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (392, 251297991, 'KateClassical', 'Катерина', 'Демидова', NULL, '2025-12-13 13:26:46.082277', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (393, 5453463111, 'Dzed_Ars', 'Арсений', 'Дедок', '+375447496462', '2025-12-13 14:04:12.922797', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (394, 606698795, 'Gymbotan', 'Анатолий', 'Печерный', '+375447693996', '2025-12-13 14:19:33.049544', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (395, 905355992, 'mariemin1', 'Marie', NULL, NULL, '2025-12-13 14:26:30.223549', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (396, 6179498277, 'anette_t', 'Anette', 'T.', NULL, '2025-12-13 14:35:35.917508', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (397, 491212711, 'Pavel_Alehavich', 'Павел', NULL, NULL, '2025-12-13 14:37:32.545460', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (398, 5920681344, 'undefined_net', 'Alexander', NULL, NULL, '2025-12-13 14:53:42.457077', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (399, 7157981959, NULL, 'Olya', 'Iliushina', NULL, '2025-12-13 15:44:57.189249', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (400, 8411472175, NULL, 'Deicelemicughe', 'Letezarrerterd', NULL, '2025-12-13 17:07:38.821384', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (401, 6493170722, 'Dondukova_Ir', 'Irina', 'Dondukova', NULL, '2025-12-13 17:07:38.821005', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (402, 2129289893, 'razbor_motor', 'Кирилл', 'Зеневич', '+375333974888', '2025-12-13 19:10:15.048230', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (403, 1339921621, 'vaj_barbuda', 'Ondrej', NULL, NULL, '2025-12-13 19:10:15.048477', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (404, 8525526547, NULL, 'Td', NULL, NULL, '2025-12-14 05:27:38.199000', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (405, 8391391401, NULL, 'JDV', NULL, NULL, '2025-12-14 06:10:29.919556', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (406, 638031821, 'olenkadel', 'Делендик', 'Ольга', '+375445792805', '2025-12-14 13:18:04.298270', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (407, 81802363, 'victorlitvinenko', 'Виктор', 'Литвиненко', '+375299751047', '2025-12-14 13:46:21.813556', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (408, 8325156007, NULL, 'Hi', NULL, NULL, '2025-12-14 14:07:23.414873', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (409, 8090428507, 'data_1993', 'Ирина', 'Гарусова', '+375447460474', '2025-12-14 18:18:47.966044', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (410, 464451702, 'darati', 'Ирина', 'Гарусова', '+375447460474', '2025-12-14 18:20:34.849769', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (411, 462639846, 'ahovanskayaa', 'Александра', 'Хованская', '+375336915547', '2025-12-14 18:33:40.770713', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (412, 194716951, 'I_PANK', 'Ihar', 'Pankou', NULL, '2025-12-15 05:39:04.348729', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (413, 1061981698, 'pleonovich', 'Polina', NULL, NULL, '2025-12-15 07:23:48.228220', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (414, 125096294, 'max_tors', 'Max', 'Tors', NULL, '2025-12-15 08:58:19.616176', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (415, 486136469, 'viki_lebsak', 'Виктория', 'Лебсак', NULL, '2025-12-15 09:06:31.722688', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (416, 428644242, 'marina_drobava', 'Марина', 'Дробова', NULL, '2025-12-15 14:59:45.270886', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (417, 1063431702, 'Glinnikov', 'NickNick', NULL, NULL, '2025-12-15 15:51:09.518749', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (418, 481996025, 'maikl_sake', 'Maikl', 'Sake', NULL, '2025-12-15 20:13:21.082666', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (419, 330479795, 'mr_kody', 'Максим', 'Μάβερικ', NULL, '2025-12-15 23:08:53.807129', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (420, 419258852, 'Mihas83', 'Михальков', 'Олег', '+375447667772', '2025-12-16 08:43:39.912852', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (421, 579887085, NULL, 'Оксана', 'Сапешко', '+375296121081', '2025-12-16 12:08:26.202536', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (422, 1469562097, 'mashkbl', 'машка', NULL, NULL, '2025-12-16 13:38:56.335906', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (423, 873330895, NULL, 'Кирилл', 'Манько', '+375296348036', '2025-12-16 14:12:15.681753', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (424, 661983280, 'OhValeri', 'Valerie', NULL, NULL, '2025-12-16 16:39:14.538828', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (425, 366631192, 'ig0r_v', 'Игорь', 'Вдовин', NULL, '2025-12-16 18:06:25.674479', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (426, 1128508582, 'Marina_medsocial', 'Marina', NULL, NULL, '2025-12-16 18:59:03.948364', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (427, 5682806397, 'multiplebits', 'Роман', 'Лукин', '+375259991618', '2025-12-16 19:56:01.439126', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (428, 44865868, NULL, 'Vadim', NULL, NULL, '2025-12-16 19:58:48.227760', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (429, 1712848937, 'vadim_privet', 'Вадим', 'В', '+375292994454', '2025-12-16 20:00:08.267553', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (430, 440265264, 'linavertinskaya', 'Лина', NULL, NULL, '2025-12-16 20:19:55.794168', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (431, 293822518, 'lazann', 'Анна', 'Лазарева', '+375296067089', '2025-12-16 23:03:21.697702', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (432, 927647090, 'ZnajuchiZnajuchi', 'Михаил', 'ЗнающийWEEX', NULL, '2025-12-17 06:10:09.603365', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (433, 1127970315, 'Togelan', 'А Л Е К С Е Й', NULL, NULL, '2025-12-17 06:37:31.843298', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (434, 105884108, 'Vasili_Kulesh', 'Кулеш', 'Василий', '+375296111168', '2025-12-17 07:17:51.035416', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (435, 542391255, 'Karioka777', 'Oleg Chumakov', NULL, NULL, '2025-12-17 09:02:44.053034', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (436, 560388061, 'vuliant', 'Владислав', 'Журавлёв', '+375333052060', '2025-12-17 10:04:50.897305', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (437, 630166149, 'Cawa_pro', 'Александр', 'Янковский', '+375296123165', '2025-12-17 10:56:40.189440', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (438, 1316007995, 'volha_sava', 'Ольга', 'Зайцева', '+375297169733', '2025-12-17 11:57:26.077064', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (439, 465139726, 'Shencev', 'Денис', 'Шенцев', '+375293406666', '2025-12-17 13:20:35.460650', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (440, 253416384, 'Helenka76', 'Lena', NULL, NULL, '2025-12-17 14:50:06.694577', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (441, 262673208, 'KseniaBirilo', 'Ксения', 'Бирило', '+79032310127', '2025-12-17 14:54:18.135463', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (442, 75578061, 'VeronikaKoppek', 'Вероника', 'Коппек', '+375296571379', '2025-12-17 14:56:52.300107', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (443, 684931521, 'alexei_rimashevskii', 'Алексей', NULL, NULL, '2025-12-17 16:23:28.382411', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (444, 545418822, 'S_I_G_N_A_L_M_A_N', 'Lesha', 'Ilykevich', NULL, '2025-12-17 16:54:24.870657', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (445, 2053949846, 'tipperaz', 'Мазаник', 'Захар', '+375292320235', '2025-12-17 16:59:25.827772', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (446, 1145379433, 'pystogolovik', 'Глеб', NULL, NULL, '2025-12-17 17:01:13.710900', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (447, 693489867, 'kopytova_v', 'Виктория', 'Копытова', '+375299340667', '2025-12-17 17:27:25.693705', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (448, 100499905, 'AlexStav1975', 'Alexander', 'Staszewski', NULL, '2025-12-17 17:44:00.921579', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (449, 302982880, 'anasstiya', 'Anastasiya', NULL, NULL, '2025-12-17 18:04:44.452539', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (450, 5671296173, 'Realtor_bjj', 'Чернявский', 'Алексей', '+375255125289', '2025-12-17 18:11:05.222468', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (451, 346544661, 'vitnevid', 'Невидомский', 'Виталий', '+375297459302', '2025-12-17 18:11:52.698035', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (452, 436881254, 'alexx1050', 'Alex', NULL, NULL, '2025-12-17 18:25:35.949857', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (453, 2002088540, 'MarinaKirilova1991', 'Marina Kirillova', NULL, NULL, '2025-12-17 19:01:21.981829', 0, 0, FALSE, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (454, 6356361896, 'DaniIlRusanov', 'Даниил', 'Русанов', '+375259601815', '2025-12-17 19:09:26.220595', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (455, 518959627, NULL, 'Далидович', 'Виталий', '+375296620504', '2025-12-17 20:22:48.899316', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (456, 1498440024, 'VeronikaMoiseeva2306', 'Вероника', 'Моисеева', '+375297712032', '2025-12-17 20:25:55.975177', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (457, 228710036, 'mihalkevich', 'Михалькевич', 'Александр', '+375292559933', '2025-12-17 20:27:46.456510', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (458, 765233355, NULL, 'Жук', 'Антон', '+375293252900', '2025-12-17 21:14:53.484917', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (459, 592051929, 'valkafea', 'Валентина', 'Иванкова', '+375298967075', '2025-12-18 07:41:19.226180', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (460, 7822494165, 'Ksp_engener', 'Сергей', 'Киркицкий', '+375445122344', '2025-12-18 09:22:56.437213', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (461, 224475397, 'diana_kalenik', 'Диана', 'Каленик', '+375447103054', '2025-12-18 09:24:53.319767', 0, 0, FALSE, '', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (462, 678690010, 'Potolochek5', 'Дмитрий', 'Половец', '+375291872235', '2025-12-18 09:45:07.288136', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (463, 252101613, 'LizLizavet', 'Liza', NULL, NULL, '2025-12-18 10:55:24.180719', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (464, 6056800079, 'blueberry3pie', 'Дубовик', 'Елизавета', '+375293358513', '2025-12-18 10:56:43.671993', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (465, 479628127, 'Vis_Katerina', 'Катерина', 'Строкова', '+375291710381', '2025-12-18 14:30:55.060655', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (466, 795791211, 'you_in_dao', 'ElectroMontazh', 'Belarus', NULL, '2025-12-18 15:29:07.205301', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (467, 5637237545, 'metacitidzen', 'MetaCitiDzen', NULL, NULL, '2025-12-18 15:49:18.397593', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (468, 945568962, 'Ivan_keRrn', 'Ivan', NULL, NULL, '2025-12-18 15:50:28.242274', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (469, 1459216776, 'valentina_marchuk', 'Valentina', 'Marchuk', NULL, '2025-12-18 16:48:14.995853', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (470, 1150558238, NULL, 'Anastasya🌺', NULL, NULL, '2025-12-18 17:16:12.528452', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (471, 169332132, 'xsushagrusha', 'Ksenia', 'S.', NULL, '2025-12-18 21:17:52.721245', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (472, 357499506, 'Pavel_BG', 'Pavel', NULL, NULL, '2025-12-19 05:08:32.282777', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (473, 386377703, 'den3master', 'Den', 'Cryptohodl', NULL, '2025-12-19 11:35:36.329855', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (474, 991396655, 'everstayhard', 'Максим', NULL, NULL, '2025-12-19 14:03:43.381698', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (475, 6297262714, 'Ai_nikitka93', 'AI', 'Nikitka93', NULL, '2025-12-19 18:57:33.578626', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES (476, 827294613, 'annyeong_anya', 'Anna', 'Bodraya', NULL, '2025-12-21 15:16:28.837908', 0, 0, FALSE, 'telegram_group', NULL, NULL, NULL, NULL)
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;


