--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: houses; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.houses VALUES ('dror', 'דרור', 'דרור', true, '2025-08-07 09:47:34.095288');
INSERT INTO public.houses VALUES ('havatzelet', 'חבצלת', 'חבצלת', true, '2025-08-07 09:47:34.095288');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.users VALUES (9, 'דביר', 'רכז', '1234', 'dvir7580@gmail.com', '0544691492', NULL, true, '2025-08-08 12:38:29.474025', '2025-08-08 13:26:29.704271', NULL, '["dror", "havatzelet"]');
INSERT INTO public.users VALUES (1, 'אלדד שרייבר', 'מדריך', '1234', 'eldad340@gmail.com', '0559495244', 100, true, '2025-08-07 10:01:50.369472', '2025-08-11 19:32:42.130243', NULL, '["dror", "havatzelet"]');
INSERT INTO public.users VALUES (3, 'שקד פישר', 'מדריך', '1234', 'shaked21990@gmail.com', '0556670640', NULL, true, '2025-08-07 10:01:10.865239', '2025-08-11 19:34:02.86465', NULL, '["dror", "havatzelet"]');
INSERT INTO public.users VALUES (2, 'תום דיסטניק', 'מדריך', '1234', 'tom.disatnik@gmail.com', '0528674914', NULL, true, '2025-08-07 10:01:50.369472', '2025-08-11 19:35:10.333563', NULL, '["dror", "havatzelet"]');
INSERT INTO public.users VALUES (5, 'עמית יחזקאלי', 'מדריך', '1234', 'shooni4710@gmail.com', '0523967683', 100, true, '2025-08-07 10:01:50.369472', '2025-08-11 19:37:03.271022', NULL, '["dror", "havatzelet"]');
INSERT INTO public.users VALUES (6, 'ליאור תמיר', 'מדריך', '1234', 'lior01899@gmail.com', '0526577998', NULL, true, '2025-08-07 10:01:10.857402', '2025-08-11 19:38:09.963328', NULL, '["dror"]');
INSERT INTO public.users VALUES (12, 'יפתח עברי', 'מדריך', '1324', 'ivryiftach@gmail.com', '0527466655', NULL, true, '2025-08-07 10:01:10.863913', '2025-08-11 19:39:44.88921', NULL, '["dror"]');
INSERT INTO public.users VALUES (4, 'עופרי שפינט', 'מדריך', '1234', 'ofrishpinat@gmail.com', '0505620796', NULL, true, '2025-08-07 10:01:10.866404', '2025-08-11 19:41:18.535652', NULL, '["dror", "havatzelet"]');
INSERT INTO public.users VALUES (8, 'רפאל עמנואל רן', 'מדריך', '1234', 'RE@dror.co.il', '0507728872', NULL, true, '2025-08-08 12:32:11.716509', '2025-08-11 19:42:34.540359', NULL, '["dror", "havatzelet"]');


--
-- Data for Name: ai_help_effectiveness; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: ai_scheduling_patterns; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: emergency_swap_requests; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.emergency_swap_requests VALUES (1, 1, '2024-01-15', 'night', 'Test emergency - guide sick', 'normal', '2025-08-08 16:44:16.916693', NULL, NULL, NULL);
INSERT INTO public.emergency_swap_requests VALUES (2, 1, '2024-01-15', 'night', 'Test emergency - guide sick', 'normal', '2025-08-08 16:45:15.797607', NULL, NULL, NULL);
INSERT INTO public.emergency_swap_requests VALUES (3, 1, '2024-01-15', 'night', 'Test emergency - guide sick', 'normal', '2025-08-08 16:45:25.850479', NULL, NULL, NULL);
INSERT INTO public.emergency_swap_requests VALUES (4, 1, '2024-01-15', 'night', 'Test emergency - guide sick', 'normal', '2025-08-08 16:46:12.551796', NULL, NULL, NULL);
INSERT INTO public.emergency_swap_requests VALUES (5, 1, '2024-01-15', 'night', 'Test emergency - guide sick', 'normal', '2025-08-08 16:46:46.426331', NULL, NULL, NULL);


--
-- Data for Name: ai_swap_suggestions; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.ai_swap_suggestions VALUES (1, 5, '{"date": "2024-01-15", "type": "direct", "priority": {"score": null, "factors": {"workloadFit": 50, "compatibility": 100, "responsiveness": 60, "timePreference": 80, "historicalAcceptance": null}, "acceptanceRate": null}, "swapType": "direct", "shiftType": "night", "complexity": 1, "description": "יפתח יחליף את המדריך הנעדר", "impactScore": null, "primaryGuide": {"id": 12, "name": "יפתח", "role": "מדריך", "email": null, "phone": null}, "originalGuide": {"id": 1}, "affectedGuides": [{"id": 12, "name": "יפתח", "role": "מדריך", "email": null, "phone": null}], "workloadImpact": null, "constraintViolations": 0, "estimatedAcceptanceRate": null}', 'direct', 1, 60, 0, 1, 'אין הפרות אילוצים • החלפה ישירה - אין צורך במדריכים נוספים', '2025-08-08 16:46:46.555875');
INSERT INTO public.ai_swap_suggestions VALUES (2, 5, '{"date": "2024-01-15", "type": "direct", "priority": {"score": null, "factors": {"workloadFit": 50, "compatibility": 100, "responsiveness": 60, "timePreference": 100, "historicalAcceptance": null}, "acceptanceRate": null}, "swapType": "direct", "shiftType": "night", "complexity": 1, "description": "תום יחליף את המדריך הנעדר", "impactScore": null, "primaryGuide": {"id": 2, "name": "תום", "role": "מדריך", "email": null, "phone": null}, "originalGuide": {"id": 1}, "affectedGuides": [{"id": 2, "name": "תום", "role": "מדריך", "email": null, "phone": null}], "workloadImpact": null, "constraintViolations": 0, "estimatedAcceptanceRate": null}', 'direct', 2, 60, 0, 1, 'אין הפרות אילוצים • החלפה ישירה - אין צורך במדריכים נוספים', '2025-08-08 16:46:46.63899');
INSERT INTO public.ai_swap_suggestions VALUES (3, 5, '{"date": "2024-01-15", "type": "direct", "priority": {"score": null, "factors": {"workloadFit": 50, "compatibility": 100, "responsiveness": 60, "timePreference": 80, "historicalAcceptance": null}, "acceptanceRate": null}, "swapType": "direct", "shiftType": "night", "complexity": 1, "description": "עופרי יחליף את המדריך הנעדר", "impactScore": null, "primaryGuide": {"id": 4, "name": "עופרי", "role": "מדריך", "email": null, "phone": null}, "originalGuide": {"id": 1}, "affectedGuides": [{"id": 4, "name": "עופרי", "role": "מדריך", "email": null, "phone": null}], "workloadImpact": null, "constraintViolations": 0, "estimatedAcceptanceRate": null}', 'direct', 3, 60, 0, 1, 'אין הפרות אילוצים • החלפה ישירה - אין צורך במדריכים נוספים', '2025-08-08 16:46:46.681753');
INSERT INTO public.ai_swap_suggestions VALUES (4, 5, '{"date": "2024-01-15", "type": "direct", "priority": {"score": null, "factors": {"workloadFit": 50, "compatibility": 80, "responsiveness": 60, "timePreference": 80, "historicalAcceptance": null}, "acceptanceRate": null}, "swapType": "direct", "shiftType": "night", "complexity": 1, "description": "עמית יחליף את המדריך הנעדר", "impactScore": null, "primaryGuide": {"id": 5, "name": "עמית", "role": "מדריך", "email": "amit@dror.com", "phone": "0544444444"}, "originalGuide": {"id": 1}, "affectedGuides": [{"id": 5, "name": "עמית", "role": "מדריך", "email": "amit@dror.com", "phone": "0544444444"}], "workloadImpact": null, "constraintViolations": 0, "estimatedAcceptanceRate": null}', 'direct', 4, 60, 0, 1, 'אין הפרות אילוצים • החלפה ישירה - אין צורך במדריכים נוספים', '2025-08-08 16:46:46.72396');
INSERT INTO public.ai_swap_suggestions VALUES (5, 5, '{"date": "2024-01-15", "type": "direct", "priority": {"score": null, "factors": {"workloadFit": 50, "compatibility": 80, "responsiveness": 60, "timePreference": 80, "historicalAcceptance": null}, "acceptanceRate": null}, "swapType": "direct", "shiftType": "night", "complexity": 1, "description": "רפאל עמנואל רן יחליף את המדריך הנעדר", "impactScore": null, "primaryGuide": {"id": 8, "name": "רפאל עמנואל רן", "role": "מדריך", "email": "RE@dror.co.il", "phone": "054446854825"}, "originalGuide": {"id": 1}, "affectedGuides": [{"id": 8, "name": "רפאל עמנואל רן", "role": "מדריך", "email": "RE@dror.co.il", "phone": "054446854825"}], "workloadImpact": null, "constraintViolations": 0, "estimatedAcceptanceRate": null}', 'direct', 5, 60, 0, 1, 'אין הפרות אילוצים • החלפה ישירה - אין צורך במדריכים נוספים', '2025-08-08 16:46:46.76667');


--
-- Data for Name: ai_suggestion_feedback; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: assignment_types; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.assignment_types VALUES (1, 'רגיל', 'משמרת רגילה', 24, 1.00, true, '2025-08-07 09:47:34.575984');
INSERT INTO public.assignment_types VALUES (2, 'חג', 'משמרת בחג', 24, 1.50, true, '2025-08-07 09:47:34.575984');
INSERT INTO public.assignment_types VALUES (3, 'שבת', 'משמרת בשבת', 24, 1.30, true, '2025-08-07 09:47:34.575984');
INSERT INTO public.assignment_types VALUES (4, 'חפיפה', 'משמרת חפיפה - 09:00 עד 10:00 למחרת', 25, 1.00, true, '2025-08-08 07:48:59.52705');
INSERT INTO public.assignment_types VALUES (5, 'כונן', 'כונן שבת סגורה - שישי 09:00 עד שבת 17:00', 32, 1.00, true, '2025-08-08 07:48:59.52705');
INSERT INTO public.assignment_types VALUES (6, 'מוצ״ש', 'מוצאי שבת - שבת 17:00 עד ראשון 09:00', 16, 1.00, true, '2025-08-08 07:48:59.52705');


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: constraints; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.constraints VALUES (37, 6, 'constraint', '2025-08-01', 'אילוץ אישי - לא זמין', 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (38, 6, 'constraint', '2025-08-02', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (39, 6, 'constraint', '2025-08-08', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (40, 6, 'constraint', '2025-08-11', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (41, 6, 'constraint', '2025-08-18', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (42, 6, 'constraint', '2025-08-21', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (43, 6, 'constraint', '2025-08-22', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (44, 6, 'constraint', '2025-08-23', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (50, 2, 'constraint', '2025-08-07', NULL, 'dror', '2025-08-07 10:01:50.37798');
INSERT INTO public.constraints VALUES (51, 2, 'constraint', '2025-08-08', NULL, 'dror', '2025-08-07 10:01:50.37798');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: coordinator_rules; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: doctor_referrals; Type: TABLE DATA; Schema: public; Owner: dvirhillelcoheneraki
--

INSERT INTO public.doctor_referrals VALUES (4, 'יוסק׳ה', 'שינה לא טובה', 'ד"ר אורית', '2025-08-09', 'בוצע', 'דביר', '2025-08-11 18:07:18.720326', '2025-08-11 15:30:04.311', 'דביר', '2025-08-11 18:30:04.314867', NULL);
INSERT INTO public.doctor_referrals VALUES (5, 'יוסק׳ה', 'שינה לא טובה', 'ד\', '2025-08-11', 'pending', 'דביר', '2025-08-11 18:33:05.444681', NULL, NULL, '2025-08-11 18:33:05.444681', NULL);


--
-- Data for Name: drafts; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: executed_swaps; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: fixed_constraints; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.fixed_constraints VALUES (1, 1, 1, NULL, NULL, 'לימודים', '2025-08-07 19:30:21.370489');
INSERT INTO public.fixed_constraints VALUES (3, 3, 0, NULL, NULL, '', '2025-08-08 08:02:41.099818');
INSERT INTO public.fixed_constraints VALUES (5, 3, 3, NULL, NULL, '', '2025-08-08 08:02:58.119618');
INSERT INTO public.fixed_constraints VALUES (4, 3, 1, NULL, NULL, '', '2025-08-08 08:02:47.573902');


--
-- Data for Name: guide_availability; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: guide_contact_history; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.guide_contact_history VALUES (2, 5, 1, 12, 1, 1, '2025-08-08 16:46:46.808783', 'phone', 'accepted', '00:05:00', NULL, 'Guide agreed immediately - very helpful!');


--
-- Data for Name: guide_preferences; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.guide_preferences VALUES (1, 12, 'emergency_response', 'willing', 0.8, true, '2025-08-08 16:46:46.860754', '2025-08-08 16:46:46.860754');
INSERT INTO public.guide_preferences VALUES (2, 12, 'contact_time_preference', 'afternoon', 0.7, true, '2025-08-08 16:46:47.125953', '2025-08-08 16:46:47.125953');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: official_schedules; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: overrides_activities; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.overrides_activities VALUES (1, '2025-08-07', '15:00:00', 'בלניך', 'אומנות', 'מירי', '2025-08-07 14:38:10.403344');
INSERT INTO public.overrides_activities VALUES (2, '2025-08-10', '15:00:00', 'קולאז׳', 'אומנות', 'גאיה', '2025-08-08 06:24:06.639942');
INSERT INTO public.overrides_activities VALUES (3, '2025-08-11', '11:30:00', 'יוגה', 'פיזית', 'מיכל', '2025-08-08 06:28:50.626074');
INSERT INTO public.overrides_activities VALUES (4, '2025-08-11', '15:00:00', 'כתיבה', 'טיפולית', 'שמוליק', '2025-08-11 18:10:24.843176');
INSERT INTO public.overrides_activities VALUES (5, '2025-08-11', '15:00:00', 'אוריגמי', 'אומנות', 'גאיה', '2025-08-11 18:11:37.38362');
INSERT INTO public.overrides_activities VALUES (6, '2025-08-11', '19:00:00', 'ליל', 'טיפולית', 'מדריך', '2025-08-11 18:29:03.739243');


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: schedule; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.schedule VALUES (63, '2025-09-30', 'שלישי', 'weekday', 1, NULL, false, false, NULL, '2025-08-07 11:32:57.128', '2025-08-07 11:32:57.128', 'אלדד', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (64, '2025-10-01', 'רביעי', 'weekday', 12, NULL, false, false, NULL, '2025-08-07 11:32:57.138', '2025-08-07 11:32:57.138', 'יפתח', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (65, '2025-10-02', 'חמישי', 'weekday', 6, 4, false, false, NULL, '2025-08-07 11:32:57.147', '2025-08-07 11:32:57.147', 'ליאור', 'מדריך ראשי', 'עופרי', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (66, '2025-10-03', 'שישי', 'weekend', 5, 3, false, false, NULL, '2025-08-07 11:32:57.155', '2025-08-07 11:32:57.155', 'עמית', 'מדריך ראשי', 'שקד', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (67, '2025-10-04', 'שבת', 'weekend', 2, NULL, false, false, NULL, '2025-08-07 11:32:57.165', '2025-08-07 11:32:57.165', 'תום', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (68, '2025-10-05', 'ראשון', 'weekday', 1, NULL, false, false, NULL, '2025-08-07 11:32:57.172', '2025-08-07 11:32:57.172', 'אלדד', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (69, '2025-10-06', 'שני', 'weekday', 12, NULL, false, false, NULL, '2025-08-07 11:32:57.181', '2025-08-07 11:32:57.181', 'יפתח', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (70, '2025-10-07', 'שלישי', 'weekday', 6, NULL, false, false, NULL, '2025-08-07 11:32:57.189', '2025-08-07 11:32:57.189', 'ליאור', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (71, '2025-10-08', 'רביעי', 'weekday', 4, NULL, false, false, NULL, '2025-08-07 11:32:57.199', '2025-08-07 11:32:57.199', 'עופרי', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (72, '2025-10-09', 'חמישי', 'weekday', 5, 3, false, false, NULL, '2025-08-07 11:32:57.206', '2025-08-07 11:32:57.206', 'עמית', 'מדריך ראשי', 'שקד', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (73, '2025-10-10', 'שישי', 'weekend', 2, 1, false, false, NULL, '2025-08-07 11:32:57.215', '2025-08-07 11:32:57.215', 'תום', 'מדריך ראשי', 'אלדד', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (74, '2025-10-11', 'שבת', 'weekend', 12, NULL, false, false, NULL, '2025-08-07 11:32:57.223', '2025-08-07 11:32:57.223', 'יפתח', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (75, '2025-10-12', 'ראשון', 'weekday', 6, NULL, false, false, NULL, '2025-08-07 11:32:57.233', '2025-08-07 11:32:57.233', 'ליאור', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (76, '2025-10-13', 'שני', 'weekday', 4, NULL, false, false, NULL, '2025-08-07 11:32:57.239', '2025-08-07 11:32:57.239', 'עופרי', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (77, '2025-10-14', 'שלישי', 'weekday', 5, NULL, false, false, NULL, '2025-08-07 11:32:57.248', '2025-08-07 11:32:57.248', 'עמית', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (78, '2025-10-15', 'רביעי', 'weekday', 3, NULL, false, false, NULL, '2025-08-07 11:32:57.256', '2025-08-07 11:32:57.256', 'שקד', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (79, '2025-10-16', 'חמישי', 'weekday', 2, 1, false, false, NULL, '2025-08-07 11:32:57.267', '2025-08-07 11:32:57.267', 'תום', 'מדריך ראשי', 'אלדד', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (80, '2025-10-17', 'שישי', 'weekend', 12, 6, false, false, NULL, '2025-08-07 11:32:57.275', '2025-08-07 11:32:57.275', 'יפתח', 'מדריך ראשי', 'ליאור', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (81, '2025-10-18', 'שבת', 'weekend', 4, NULL, false, false, NULL, '2025-08-07 11:32:57.285', '2025-08-07 11:32:57.285', 'עופרי', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (82, '2025-10-19', 'ראשון', 'weekday', 5, NULL, false, false, NULL, '2025-08-07 11:32:57.292', '2025-08-07 11:32:57.292', 'עמית', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (83, '2025-10-20', 'שני', 'weekday', 3, NULL, false, false, NULL, '2025-08-07 11:32:57.303', '2025-08-07 11:32:57.303', 'שקד', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (84, '2025-10-21', 'שלישי', 'weekday', 2, NULL, false, false, NULL, '2025-08-07 11:32:57.312', '2025-08-07 11:32:57.312', 'תום', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (85, '2025-10-22', 'רביעי', 'weekday', 1, NULL, false, false, NULL, '2025-08-07 11:32:57.322', '2025-08-07 11:32:57.322', 'אלדד', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (86, '2025-10-23', 'חמישי', 'weekday', 12, 6, false, false, NULL, '2025-08-07 11:32:57.333', '2025-08-07 11:32:57.333', 'יפתח', 'מדריך ראשי', 'ליאור', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (87, '2025-10-24', 'שישי', 'weekend', 4, 5, false, false, NULL, '2025-08-07 11:32:57.341', '2025-08-07 11:32:57.341', 'עופרי', 'מדריך ראשי', 'עמית', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (88, '2025-10-25', 'שבת', 'weekend', 3, NULL, false, false, NULL, '2025-08-07 11:32:57.352', '2025-08-07 11:32:57.352', 'שקד', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (89, '2025-10-26', 'ראשון', 'weekday', 2, NULL, false, false, NULL, '2025-08-07 11:32:57.361', '2025-08-07 11:32:57.361', 'תום', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (90, '2025-10-27', 'שני', 'weekday', 1, NULL, false, false, NULL, '2025-08-07 11:32:57.371', '2025-08-07 11:32:57.371', 'אלדד', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (91, '2025-10-28', 'שלישי', 'weekday', 12, NULL, false, false, NULL, '2025-08-07 11:32:57.381', '2025-08-07 11:32:57.381', 'יפתח', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (92, '2025-10-29', 'רביעי', 'weekday', 6, NULL, false, false, NULL, '2025-08-07 11:32:57.389', '2025-08-07 11:32:57.389', 'ליאור', 'מדריך ראשי', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (93, '2025-10-30', 'חמישי', 'weekday', 4, 5, false, false, NULL, '2025-08-07 11:32:57.399', '2025-08-07 11:32:57.399', 'עופרי', 'מדריך ראשי', 'עמית', 'מדריך שני', 'dror');
INSERT INTO public.schedule VALUES (94, '2025-08-01', 'שישי', 'רגיל+חפיפה', 8, 2, false, false, NULL, '2025-08-10 09:20:36.015494', '2025-08-10 09:20:36.015494', 'רפאל עמנואל רן', 'רגיל', 'תום', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (95, '2025-08-02', 'שבת', 'רגיל+חפיפה', 1, 12, false, false, NULL, '2025-08-10 09:20:36.018038', '2025-08-10 09:20:36.018038', 'אלדד', 'רגיל', 'יפתח', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (96, '2025-08-03', 'ראשון', 'רגיל+חפיפה', 4, 5, false, false, NULL, '2025-08-10 09:20:36.01913', '2025-08-10 09:20:36.01913', 'עופרי', 'רגיל', 'עמית', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (97, '2025-08-04', 'שני', 'רגיל+חפיפה', 4, 5, false, false, NULL, '2025-08-10 09:20:36.02074', '2025-08-10 09:20:36.02074', 'עופרי', 'רגיל', 'עמית', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (98, '2025-08-05', 'שלישי', 'רגיל+חפיפה', 6, 3, false, false, NULL, '2025-08-10 09:20:36.0219', '2025-08-10 09:20:36.0219', 'ליאור', 'רגיל', 'שקד', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (99, '2025-08-06', 'רביעי', 'רגיל+חפיפה', 6, 8, false, false, NULL, '2025-08-10 09:20:36.022924', '2025-08-10 09:20:36.022924', 'ליאור', 'רגיל', 'רפאל עמנואל רן', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (100, '2025-08-07', 'חמישי', 'רגיל+חפיפה', 2, 12, false, false, NULL, '2025-08-10 09:20:36.023854', '2025-08-10 09:20:36.023854', 'תום', 'רגיל', 'יפתח', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (101, '2025-08-08', 'שישי', 'כונן', 3, NULL, false, false, NULL, '2025-08-10 09:20:36.024788', '2025-08-10 09:20:36.024788', 'שקד', 'כונן', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (102, '2025-08-09', 'שבת', 'מוצ״ש', 3, 1, false, false, NULL, '2025-08-10 09:20:36.025604', '2025-08-10 09:20:36.025604', 'שקד', 'כונן', 'אלדד', 'מוצ״ש', 'dror');
INSERT INTO public.schedule VALUES (103, '2025-08-10', 'ראשון', 'רגיל+חפיפה', 4, 5, false, false, NULL, '2025-08-10 09:20:36.026339', '2025-08-10 09:20:36.026339', 'עופרי', 'רגיל', 'עמית', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (104, '2025-08-11', 'שני', 'רגיל+חפיפה', 2, 12, false, false, NULL, '2025-08-10 09:20:36.027181', '2025-08-10 09:20:36.027181', 'תום', 'רגיל', 'יפתח', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (105, '2025-08-12', 'שלישי', 'רגיל+חפיפה', 6, 8, false, false, NULL, '2025-08-10 09:20:36.028753', '2025-08-10 09:20:36.028753', 'ליאור', 'רגיל', 'רפאל עמנואל רן', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (106, '2025-08-13', 'רביעי', 'רגיל+חפיפה', 6, 4, false, false, NULL, '2025-08-10 09:20:36.02959', '2025-08-10 09:20:36.02959', 'ליאור', 'רגיל', 'עופרי', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (107, '2025-08-14', 'חמישי', 'רגיל+חפיפה', 5, 4, false, false, NULL, '2025-08-10 09:20:36.030418', '2025-08-10 09:20:36.030418', 'עמית', 'רגיל', 'עופרי', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (108, '2025-08-15', 'שישי', 'רגיל+חפיפה', 12, 2, false, false, NULL, '2025-08-10 09:20:36.031451', '2025-08-10 09:20:36.031451', 'יפתח', 'רגיל', 'תום', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (109, '2025-08-16', 'שבת', 'רגיל+חפיפה', 8, 1, false, false, NULL, '2025-08-10 09:20:36.032481', '2025-08-10 09:20:36.032481', 'רפאל עמנואל רן', 'רגיל', 'אלדד', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (110, '2025-08-17', 'ראשון', 'רגיל+חפיפה', 6, 5, false, false, NULL, '2025-08-10 09:20:36.033278', '2025-08-10 09:20:36.033278', 'ליאור', 'רגיל', 'עמית', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (111, '2025-08-18', 'שני', 'רגיל+חפיפה', 5, 4, false, false, NULL, '2025-08-10 09:20:36.033991', '2025-08-10 09:20:36.033991', 'עמית', 'רגיל', 'עופרי', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (112, '2025-08-19', 'שלישי', 'רגיל+חפיפה', 2, 12, false, false, NULL, '2025-08-10 09:20:36.0346', '2025-08-10 09:20:36.0346', 'תום', 'רגיל', 'יפתח', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (113, '2025-08-20', 'רביעי', 'רגיל+חפיפה', 8, 6, false, false, NULL, '2025-08-10 09:20:36.035235', '2025-08-10 09:20:36.035235', 'רפאל עמנואל רן', 'רגיל', 'ליאור', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (114, '2025-08-21', 'חמישי', 'רגיל+חפיפה', 6, 8, false, false, NULL, '2025-08-10 09:20:36.036004', '2025-08-10 09:20:36.036004', 'ליאור', 'רגיל', 'רפאל עמנואל רן', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (115, '2025-08-22', 'שישי', 'כונן', 5, NULL, false, false, NULL, '2025-08-10 09:20:36.036742', '2025-08-10 09:20:36.036742', 'עמית', 'כונן', NULL, NULL, 'dror');
INSERT INTO public.schedule VALUES (116, '2025-08-23', 'שבת', 'מוצ״ש', 5, 4, false, false, NULL, '2025-08-10 09:20:36.037396', '2025-08-10 09:20:36.037396', 'עמית', 'כונן', 'עופרי', 'מוצ״ש', 'dror');
INSERT INTO public.schedule VALUES (117, '2025-08-24', 'ראשון', 'רגיל+חפיפה', 12, 2, false, false, NULL, '2025-08-10 09:20:36.038025', '2025-08-10 09:20:36.038025', 'יפתח', 'רגיל', 'תום', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (118, '2025-08-25', 'שני', 'רגיל+חפיפה', 8, 12, false, false, NULL, '2025-08-10 09:20:36.038592', '2025-08-10 09:20:36.038592', 'רפאל עמנואל רן', 'רגיל', 'יפתח', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (119, '2025-08-26', 'שלישי', 'רגיל+חפיפה', 6, 12, false, false, NULL, '2025-08-10 09:20:36.039162', '2025-08-10 09:20:36.039162', 'ליאור', 'רגיל', 'יפתח', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (120, '2025-08-27', 'רביעי', 'רגיל+חפיפה', 2, 4, false, false, NULL, '2025-08-10 09:20:36.039792', '2025-08-10 09:20:36.039792', 'תום', 'רגיל', 'עופרי', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (121, '2025-08-28', 'חמישי', 'רגיל+חפיפה', 2, 8, false, false, NULL, '2025-08-10 09:20:36.040397', '2025-08-10 09:20:36.040397', 'תום', 'רגיל', 'רפאל עמנואל רן', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (122, '2025-08-29', 'שישי', 'רגיל+חפיפה', 1, 6, false, false, NULL, '2025-08-10 09:20:36.04104', '2025-08-10 09:20:36.04104', 'אלדד', 'רגיל', 'ליאור', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (123, '2025-08-30', 'שבת', 'רגיל+חפיפה', 12, 6, false, false, NULL, '2025-08-10 09:20:36.041662', '2025-08-10 09:20:36.041662', 'יפתח', 'רגיל', 'ליאור', 'חפיפה', 'dror');
INSERT INTO public.schedule VALUES (124, '2025-08-31', 'ראשון', 'רגיל+חפיפה', 4, 8, false, false, NULL, '2025-08-10 09:20:36.042221', '2025-08-10 09:20:36.042221', 'עופרי', 'רגיל', 'רפאל עמנואל רן', 'חפיפה', 'dror');


--
-- Data for Name: schedule_draft; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: schedule_history; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: scheduling_rules; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: shabbat_status; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: shift_types; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.shift_types VALUES (1, 'רגיל', 'משמרת רגילה', 2, '["מדריך", "מדריך"]', true, '2025-08-07 09:47:34.57798');
INSERT INTO public.shift_types VALUES (2, 'רכז', 'משמרת עם רכז', 2, '["רכז", "מדריך"]', true, '2025-08-07 09:47:34.57798');
INSERT INTO public.shift_types VALUES (3, 'weekday', 'יום חול רגיל', 2, '["רגיל", "חפיפה"]', true, '2025-08-08 07:48:59.554829');
INSERT INTO public.shift_types VALUES (4, 'weekend_open', 'סוף שבוע פתוח', 2, '["רגיל", "חפיפה"]', true, '2025-08-08 07:48:59.554829');
INSERT INTO public.shift_types VALUES (5, 'weekend_closed', 'סוף שבוע סגור', 1, '["כונן"]', true, '2025-08-08 07:48:59.554829');
INSERT INTO public.shift_types VALUES (6, 'holiday', 'חג', 2, '["רגיל", "חפיפה"]', true, '2025-08-08 07:48:59.554829');


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: task_templates; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.task_templates VALUES (1, 'בדיקת תקינות מטבח', 'בדיקה יומית של תקינות המטבח', 'בדיקת תקינות מטבח - בדיקת כל הציוד והמכשירים', 'רגיל', 'תחזוקה', 1, NULL, true, NULL, '2025-08-08 16:24:41.226577', 0);
INSERT INTO public.task_templates VALUES (2, 'ניקוי חדר אוכל', 'ניקוי יומי של חדר האוכל', 'ניקוי חדר אוכל - שולחנות, כיסאות ורצפה', 'רגיל', 'ניקיון', 2, NULL, true, NULL, '2025-08-08 16:24:41.226577', 0);
INSERT INTO public.task_templates VALUES (3, 'בדיקת בטיחות', 'בדיקת בטיחות יומית', 'בדיקת בטיחות - יציאות חירום, מטפים וציוד בטיחות', 'גבוה', 'בטיחות', 1, NULL, true, NULL, '2025-08-08 16:24:41.226577', 0);


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.tasks VALUES (2, 'חפיפה: יוני יוצא לפגישה לגבי טיפולי המשך בשעה 12:00, חוזר בערב', '2025-08-07 17:40:01.355', NULL, NULL, 'בוצע', '2025-08-07', NULL, 9, '2025-08-08 12:28:36.329', 'dror', 'רגיל', NULL, NULL, 1, 'חברה', NULL, NULL);
INSERT INTO public.tasks VALUES (12, 'חפיפה : משה, בדיקות דם', '2025-08-08 12:35:53.179', 9, NULL, 'בוצע', '2025-08-08', NULL, 9, '2025-08-08 12:52:10.111', 'dror', 'רגיל', NULL, NULL, 1, 'חברה', NULL, NULL);
INSERT INTO public.tasks VALUES (4, 'חפיפה : אלווין, בדיקות דם', '2025-08-08 03:47:07.976', NULL, 12, 'פתוחה', '2025-08-08', NULL, NULL, NULL, 'dror', 'רגיל', '2025-08-08 17:00:32.493794', NULL, 1, 'חברה', NULL, NULL);
INSERT INTO public.tasks VALUES (16, 'חפיפה: יוני יוצא לפגישה לגבי טיפולי המשך בשעה 12:00, חוזר בערב', '2025-08-08 14:09:35.049', NULL, NULL, 'בוצע', '2025-08-08', NULL, 9, '2025-08-09 06:09:07.544', 'dror', 'רגיל', NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO public.tasks VALUES (1, 'משימה לדוגמה', '2025-08-07 17:39:25.219', NULL, 6, 'בוצע', NULL, 'הערה לדוגמה', NULL, '2025-08-07 14:45:00', 'dror', 'רגיל', NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO public.tasks VALUES (15, 'חפיפה : משה, בדיקות דם 1', '2025-08-08 13:28:43.951', 9, NULL, 'בוצע', '2025-08-08', NULL, 9, '2025-08-11 15:30:01.192', 'dror', 'רגיל', NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO public.tasks VALUES (3, 'נסיון בדיקה', '2025-08-07 17:45:52.253', NULL, NULL, 'בוצע', '2025-08-09', NULL, NULL, '2025-08-08 03:55:01.438', 'dror', 'רגיל', NULL, NULL, 1, 'רפואה', NULL, NULL);
INSERT INTO public.tasks VALUES (10, 'משימה חדשה לבדיקה', '2025-08-08 10:21:23.779', NULL, NULL, 'בוצע', '2025-08-08', NULL, 9, '2025-08-08 12:33:27.207', 'dror', 'רגיל', NULL, NULL, 1, 'רפואה', NULL, NULL);
INSERT INTO public.tasks VALUES (13, 'נסיון בדיקה 2', '2025-08-08 12:36:03.385', 9, NULL, 'בוצע', '2025-08-08', NULL, 9, '2025-08-08 12:36:08.912', 'dror', 'רגיל', NULL, NULL, 1, 'רפואה', NULL, NULL);
INSERT INTO public.tasks VALUES (6, 'משימה חדשה לבדיקה', '2025-08-08 10:18:26.573', NULL, NULL, 'בוצע', '2025-08-08', NULL, 9, '2025-08-08 12:56:08.125', 'dror', 'רגיל', NULL, NULL, 1, 'רפואה', NULL, NULL);
INSERT INTO public.tasks VALUES (14, 'חפיפה : אלווין, בדיקות דם', '2025-08-08 12:59:42.507', 9, 1, 'בוצע', '2025-08-08', NULL, 9, '2025-08-11 15:35:31.128', 'dror', 'רגיל', '2025-08-08 16:26:44.864642', NULL, 1, 'חברה', NULL, NULL);
INSERT INTO public.tasks VALUES (17, 'נסיון בדיקה', '2025-08-11 16:22:42.874', 9, NULL, 'פתוחה', '2025-08-11', NULL, NULL, NULL, 'dror', 'רגיל', NULL, NULL, 1, NULL, NULL, NULL);


--
-- Data for Name: user_interaction_patterns; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.user_interaction_patterns VALUES (1, 12, 'emergency_contact_accepted', '{"emergency_id": 5, "contact_order": 1}', 1, '2025-08-08 16:46:47.208381', 1, '00:05:00');


--
-- Data for Name: vacations; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Data for Name: weekend_types; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.weekend_types VALUES (27, '2025-08-01', false, '2025-08-10 05:27:04.004541');
INSERT INTO public.weekend_types VALUES (2, '2025-08-22', true, '2025-08-08 09:14:43.041016');
INSERT INTO public.weekend_types VALUES (1, '2025-08-08', true, '2025-08-08 09:14:41.604279');


--
-- Data for Name: weekly_activities; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

INSERT INTO public.weekly_activities VALUES (2, 'שני', '10:00:00', '01:30:00', 'פעילות נוספת', 'אומנות', 'דביר', '2025-08-07 14:35:56.39118');
INSERT INTO public.weekly_activities VALUES (3, 'ראשון', '09:00:00', NULL, 'קבוצת בוקר', 'טיפולית', 'שיי לי', '2025-08-07 14:37:15.606464');
INSERT INTO public.weekly_activities VALUES (4, 'שלישי', '09:00:00', NULL, 'קבוצת בוקר', 'טיפולית', 'מיכל', '2025-08-11 18:11:10.094706');


--
-- Data for Name: workflow_status; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--



--
-- Name: ai_help_effectiveness_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.ai_help_effectiveness_id_seq', 1, false);


--
-- Name: ai_scheduling_patterns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.ai_scheduling_patterns_id_seq', 1, false);


--
-- Name: ai_suggestion_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.ai_suggestion_feedback_id_seq', 1, false);


--
-- Name: ai_swap_suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.ai_swap_suggestions_id_seq', 5, true);


--
-- Name: assignment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.assignment_types_id_seq', 213, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 1, false);


--
-- Name: constraints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.constraints_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- Name: coordinator_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.coordinator_rules_id_seq', 2, true);


--
-- Name: doctor_referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dvirhillelcoheneraki
--

SELECT pg_catalog.setval('public.doctor_referrals_id_seq', 5, true);


--
-- Name: drafts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.drafts_id_seq', 1, false);


--
-- Name: email_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.email_logs_id_seq', 1, false);


--
-- Name: emergency_swap_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.emergency_swap_requests_id_seq', 5, true);


--
-- Name: executed_swaps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.executed_swaps_id_seq', 1, false);


--
-- Name: fixed_constraints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.fixed_constraints_id_seq', 5, true);


--
-- Name: guide_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.guide_availability_id_seq', 1, false);


--
-- Name: guide_contact_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.guide_contact_history_id_seq', 2, true);


--
-- Name: guide_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.guide_preferences_id_seq', 2, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: official_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.official_schedules_id_seq', 1, false);


--
-- Name: overrides_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.overrides_activities_id_seq', 6, true);


--
-- Name: referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.referrals_id_seq', 1, false);


--
-- Name: schedule_draft_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.schedule_draft_id_seq', 7, true);


--
-- Name: schedule_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.schedule_history_id_seq', 1, false);


--
-- Name: schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.schedule_id_seq', 124, true);


--
-- Name: scheduling_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.scheduling_rules_id_seq', 1, false);


--
-- Name: shift_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.shift_types_id_seq', 280, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.shifts_id_seq', 1, false);


--
-- Name: task_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.task_templates_id_seq', 3, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.tasks_id_seq', 17, true);


--
-- Name: user_interaction_patterns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.user_interaction_patterns_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: vacations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.vacations_id_seq', 1, true);


--
-- Name: weekend_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.weekend_types_id_seq', 35, true);


--
-- Name: weekly_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.weekly_activities_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

