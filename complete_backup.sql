PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  , password TEXT, email TEXT, phone TEXT, percent INTEGER, is_active BOOLEAN DEFAULT 1, created_at TEXT, updated_at TEXT, house_id VARCHAR(50) DEFAULT 'dror', accessible_houses TEXT DEFAULT '["dror", "havatzelet"]');
INSERT INTO users VALUES(1,'אלדד','מדריך','eldad123','eldad@dror.co.il','051111111',100,1,NULL,NULL,'dror','["dror"]');
INSERT INTO users VALUES(2,'תום','מדריך','tom123',NULL,NULL,NULL,1,NULL,NULL,'dror','["dror"]');
INSERT INTO users VALUES(3,'שקד','מדריך','shaked123',NULL,NULL,NULL,1,NULL,NULL,'dror','["dror"]');
INSERT INTO users VALUES(4,'עופרי','מדריך','ofri123',NULL,NULL,NULL,1,NULL,NULL,'dror','["dror"]');
INSERT INTO users VALUES(5,'עמית','מדריך','amit123','amit@dror.com','0544444444',100,1,NULL,NULL,'dror','["dror"]');
INSERT INTO users VALUES(6,'יפתח','מדריך','yiftach123',NULL,NULL,NULL,1,NULL,NULL,'dror','["dror"]');
INSERT INTO users VALUES(7,'רפאל','מדריך','refael123',NULL,NULL,NULL,1,NULL,NULL,'dror','["dror"]');
INSERT INTO users VALUES(8,'סיגל','רכז','admin123',NULL,NULL,NULL,1,NULL,NULL,'dror','["dror", "havatzelet"]');
INSERT INTO users VALUES(10,'דביר','רכז','1234','dvir7580@gmail.com','0544691492',100,1,NULL,NULL,'dror','["dror","havatzelet"]');
INSERT INTO users VALUES(12,'ליאור','מדריך','1234','lior@dror.co.il','5022445445',100,1,NULL,NULL,'dror','["dror"]');
CREATE TABLE constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    details TEXT
  , house_id VARCHAR(50) NOT NULL DEFAULT 'dror');
INSERT INTO constraints VALUES(37,6,'constraint','2025-08-01','אילוץ אישי - לא זמין','dror');
INSERT INTO constraints VALUES(38,6,'constraint','2025-08-02','','dror');
INSERT INTO constraints VALUES(39,6,'constraint','2025-08-08','','dror');
INSERT INTO constraints VALUES(40,6,'constraint','2025-08-11','','dror');
INSERT INTO constraints VALUES(41,6,'constraint','2025-08-18','','dror');
INSERT INTO constraints VALUES(42,6,'constraint','2025-08-21','','dror');
INSERT INTO constraints VALUES(43,6,'constraint','2025-08-22','','dror');
INSERT INTO constraints VALUES(44,6,'constraint','2025-08-23','','dror');
INSERT INTO constraints VALUES(50,2,'constraint','2025-08-07','','dror');
INSERT INTO constraints VALUES(51,2,'constraint','2025-08-08','','dror');
INSERT INTO constraints VALUES(52,2,'constraint','2025-08-09','','dror');
INSERT INTO constraints VALUES(53,2,'constraint','2025-08-11','','dror');
INSERT INTO constraints VALUES(54,2,'constraint','2025-08-28','','dror');
INSERT INTO constraints VALUES(55,2,'constraint','2025-08-29','','dror');
INSERT INTO constraints VALUES(56,2,'constraint','2025-08-30','','dror');
INSERT INTO constraints VALUES(57,1,'constraint','2025-08-01','אילוץ אישי - לא זמין','dror');
INSERT INTO constraints VALUES(58,1,'constraint','2025-08-02','','dror');
INSERT INTO constraints VALUES(59,4,'constraint','2025-08-05','','dror');
INSERT INTO constraints VALUES(60,4,'constraint','2025-08-06','','dror');
INSERT INTO constraints VALUES(61,4,'constraint','2025-08-07','','dror');
INSERT INTO constraints VALUES(62,4,'constraint','2025-08-08','','dror');
INSERT INTO constraints VALUES(63,4,'constraint','2025-08-09','','dror');
INSERT INTO constraints VALUES(64,4,'constraint','2025-08-27','','dror');
INSERT INTO constraints VALUES(65,4,'constraint','2025-08-28','','dror');
INSERT INTO constraints VALUES(66,5,'constraint','2025-08-01','אילוץ אישי - לא זמין','dror');
INSERT INTO constraints VALUES(75,12,'constraint','2025-08-01','אילוץ אישי - לא זמין','dror');
INSERT INTO constraints VALUES(76,12,'constraint','2025-08-02','','dror');
INSERT INTO constraints VALUES(77,12,'constraint','2025-08-18','','dror');
INSERT INTO constraints VALUES(78,12,'constraint','2025-08-23','','dror');
INSERT INTO constraints VALUES(79,12,'constraint','2025-08-30','','dror');
INSERT INTO constraints VALUES(80,5,'constraint','2025-08-13','','dror');
INSERT INTO constraints VALUES(81,5,'constraint','2025-08-14','','dror');
INSERT INTO constraints VALUES(82,5,'constraint','2025-08-15','','dror');
INSERT INTO constraints VALUES(83,5,'constraint','2025-08-16','','dror');
INSERT INTO constraints VALUES(84,5,'constraint','2025-08-17','','dror');
INSERT INTO constraints VALUES(85,5,'constraint','2025-08-18','','dror');
INSERT INTO constraints VALUES(86,5,'constraint','2025-08-19','','dror');
INSERT INTO constraints VALUES(87,5,'constraint','2025-08-20','','dror');
INSERT INTO constraints VALUES(88,5,'constraint','2025-08-21','','dror');
INSERT INTO constraints VALUES(89,5,'constraint','2025-08-22','','dror');
INSERT INTO constraints VALUES(90,5,'constraint','2025-08-23','','dror');
INSERT INTO constraints VALUES(91,5,'constraint','2025-08-24','','dror');
INSERT INTO constraints VALUES(92,5,'constraint','2025-08-25','','dror');
INSERT INTO constraints VALUES(93,5,'constraint','2025-08-26','','dror');
INSERT INTO constraints VALUES(94,5,'constraint','2025-08-27','','dror');
INSERT INTO constraints VALUES(95,5,'constraint','2025-08-28','','dror');
INSERT INTO constraints VALUES(96,5,'constraint','2025-08-29','','dror');
INSERT INTO constraints VALUES(97,5,'constraint','2025-08-30','','dror');
INSERT INTO constraints VALUES(98,5,'constraint','2025-08-31','','dror');
CREATE TABLE fixed_constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    weekday INTEGER NOT NULL,
    hour_start TEXT,
    hour_end TEXT,
    details TEXT
  );
INSERT INTO fixed_constraints VALUES(9,1,1,'','','לבקשתו');
INSERT INTO fixed_constraints VALUES(10,2,0,'','','לבקשתה');
INSERT INTO fixed_constraints VALUES(11,3,0,'','','');
INSERT INTO fixed_constraints VALUES(12,3,1,'','','');
INSERT INTO fixed_constraints VALUES(13,3,3,'','','');
CREATE TABLE vacations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date_start TEXT NOT NULL,
    date_end TEXT NOT NULL,
    note TEXT,
    status TEXT,
    response_note TEXT
  );
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY,
    updated_at TEXT
  );
INSERT INTO conversations VALUES(1,'2025-08-04T09:00:00.000Z');
INSERT INTO conversations VALUES(2,'2025-07-20T04:51:13.692Z');
INSERT INTO conversations VALUES(3,'2025-08-06T11:30:00.000Z');
INSERT INTO conversations VALUES(4,'2025-08-07T12:20:00.000Z');
INSERT INTO conversations VALUES(5,'2025-07-18T08:57:35.591Z');
INSERT INTO conversations VALUES(6,'2025-07-20T04:38:47.605Z');
INSERT INTO conversations VALUES(7,'2025-07-20T04:40:56.986Z');
INSERT INTO conversations VALUES(8,'2025-07-20T04:46:09.377Z');
INSERT INTO conversations VALUES(9,'2025-07-20T04:47:44.203Z');
INSERT INTO conversations VALUES(10,'2025-07-20T04:51:30.339Z');
CREATE TABLE conversation_participants (
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL
  );
INSERT INTO conversation_participants VALUES(1,2);
INSERT INTO conversation_participants VALUES(2,5);
INSERT INTO conversation_participants VALUES(2,2);
INSERT INTO conversation_participants VALUES(3,6);
INSERT INTO conversation_participants VALUES(3,1);
INSERT INTO conversation_participants VALUES(4,5);
INSERT INTO conversation_participants VALUES(5,5);
INSERT INTO conversation_participants VALUES(5,6);
INSERT INTO conversation_participants VALUES(6,8);
INSERT INTO conversation_participants VALUES(7,6);
INSERT INTO conversation_participants VALUES(8,1);
INSERT INTO conversation_participants VALUES(9,5);
INSERT INTO conversation_participants VALUES(9,8);
INSERT INTO conversation_participants VALUES(10,5);
INSERT INTO conversation_participants VALUES(10,10);
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
INSERT INTO messages VALUES(3,2,5,2,'היי תום, תוכל להחליף אותי ביום חמישי?','2025-08-05T09:00:00.000Z');
INSERT INTO messages VALUES(4,2,2,5,'כן, אין בעיה!','2025-08-05T09:10:00.000Z');
INSERT INTO messages VALUES(5,2,5,2,'תודה רבה!','2025-08-05T10:15:00.000Z');
INSERT INTO messages VALUES(6,3,6,1,'היי אלדד, תוכל להחליף אותי בשבת?','2025-08-06T10:00:00.000Z');
INSERT INTO messages VALUES(7,3,1,6,'כן, אני פנוי.','2025-08-06T11:30:00.000Z');
INSERT INTO messages VALUES(10,5,5,6,'יפתח, תוכל להחליף אותי ביום שישי?','2025-08-08T12:30:00.000Z');
INSERT INTO messages VALUES(11,5,6,5,'כן, אני זמין.','2025-08-08T13:00:00.000Z');
INSERT INTO messages VALUES(12,5,5,6,'תודה רבה!','2025-08-08T13:45:00.000Z');
INSERT INTO messages VALUES(1752829055591,5,5,6,'כפרה עליך','2025-07-18T08:57:35.591Z');
INSERT INTO messages VALUES(1752829055592,2,5,2,'כפרה עליך','2025-07-20T04:51:13.692Z');
INSERT INTO messages VALUES(1752829055593,10,5,10,'vhh','2025-07-20T04:51:30.339Z');
CREATE TABLE overrides_activities (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    facilitator TEXT
  );
INSERT INTO overrides_activities VALUES(201,'2025-07-14','09:00','מדיטציה','פיזית','דנה');
INSERT INTO overrides_activities VALUES(1752381135991,'2025-07-17','09:00','יצירה אקטיבית','אומנות','טיטה');
INSERT INTO overrides_activities VALUES(1752575818126,'2025-07-15','15:00','חוויית הטבע','פיזית','ג׳קי המלך');
INSERT INTO overrides_activities VALUES(1752666348605,'2025-07-16','17:00','הליכה לים','פיזית','יוסי');
CREATE TABLE referrals (
    id INTEGER PRIMARY KEY,
    patient TEXT NOT NULL,
    reason TEXT NOT NULL,
    doctor TEXT NOT NULL,
    date TEXT NOT NULL,
    created_by TEXT,
    created_at TEXT
  );
INSERT INTO referrals VALUES(1752737907061,'יוסק׳ה','שינה לא טובה','ד\','2025-07-17','דביר','2025-07-17T07:38:27.061Z');
INSERT INTO referrals VALUES(1752737939678,'חיימון','קם עייף ולוקח לו זמן להתעורר','ד\','2025-07-18','דביר','2025-07-17T07:38:59.678Z');
CREATE TABLE schedule_draft (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weekday TEXT NOT NULL,
    type TEXT NOT NULL,
    guide1_id INTEGER,
    guide2_id INTEGER
  , name TEXT);
INSERT INTO schedule_draft VALUES(439,'2025-08-01','שישי','שבת פתוחה',4,3,'טיוטא1');
INSERT INTO schedule_draft VALUES(440,'2025-08-02','שבת','שבת פתוחה',2,5,'טיוטא1');
INSERT INTO schedule_draft VALUES(441,'2025-08-03','ראשון','רגיל',4,7,'טיוטא1');
INSERT INTO schedule_draft VALUES(442,'2025-08-04','שני','רגיל',6,5,'טיוטא1');
INSERT INTO schedule_draft VALUES(443,'2025-08-05','שלישי','רגיל',3,1,'טיוטא1');
INSERT INTO schedule_draft VALUES(444,'2025-08-06','רביעי','רגיל',6,12,'טיוטא1');
INSERT INTO schedule_draft VALUES(445,'2025-08-07','חמישי','רגיל',5,3,'טיוטא1');
INSERT INTO schedule_draft VALUES(446,'2025-08-08','שישי','שבת פתוחה',12,NULL,'טיוטא1');
INSERT INTO schedule_draft VALUES(447,'2025-08-09','שבת','שבת פתוחה',12,6,'טיוטא1');
INSERT INTO schedule_draft VALUES(448,'2025-08-10','ראשון','רגיל',4,1,'טיוטא1');
INSERT INTO schedule_draft VALUES(449,'2025-08-11','שני','רגיל',12,5,'טיוטא1');
INSERT INTO schedule_draft VALUES(450,'2025-08-12','שלישי','רגיל',4,6,'טיוטא1');
INSERT INTO schedule_draft VALUES(451,'2025-08-13','רביעי','רגיל',1,7,'טיוטא1');
INSERT INTO schedule_draft VALUES(452,'2025-08-14','חמישי','רגיל',3,2,'טיוטא1');
INSERT INTO schedule_draft VALUES(453,'2025-08-15','שישי','שבת פתוחה',12,4,'טיוטא1');
INSERT INTO schedule_draft VALUES(454,'2025-08-16','שבת','שבת פתוחה',6,2,'טיוטא1');
INSERT INTO schedule_draft VALUES(455,'2025-08-17','ראשון','רגיל',12,7,'טיוטא1');
INSERT INTO schedule_draft VALUES(456,'2025-08-18','שני','רגיל',2,4,'טיוטא1');
INSERT INTO schedule_draft VALUES(457,'2025-08-19','שלישי','רגיל',3,6,'טיוטא1');
INSERT INTO schedule_draft VALUES(458,'2025-08-20','רביעי','רגיל',1,4,'טיוטא1');
INSERT INTO schedule_draft VALUES(459,'2025-08-21','חמישי','רגיל',12,2,'טיוטא1');
INSERT INTO schedule_draft VALUES(460,'2025-08-22','שישי','שבת פתוחה',3,NULL,'טיוטא1');
INSERT INTO schedule_draft VALUES(461,'2025-08-23','שבת','שבת פתוחה',3,2,'טיוטא1');
INSERT INTO schedule_draft VALUES(462,'2025-08-24','ראשון','רגיל',6,1,'טיוטא1');
INSERT INTO schedule_draft VALUES(463,'2025-08-25','שני','רגיל',12,2,'טיוטא1');
INSERT INTO schedule_draft VALUES(464,'2025-08-26','שלישי','רגיל',3,1,'טיוטא1');
INSERT INTO schedule_draft VALUES(465,'2025-08-27','רביעי','רגיל',2,7,'טיוטא1');
INSERT INTO schedule_draft VALUES(466,'2025-08-28','חמישי','רגיל',6,3,'טיוטא1');
INSERT INTO schedule_draft VALUES(467,'2025-08-29','שישי','שבת פתוחה',7,1,'טיוטא1');
INSERT INTO schedule_draft VALUES(468,'2025-08-30','שבת','שבת פתוחה',6,1,'טיוטא1');
INSERT INTO schedule_draft VALUES(469,'2025-08-31','ראשון','רגיל',4,12,'טיוטא1');
INSERT INTO schedule_draft VALUES(470,'2025-08-01','שישי','שבת פתוחה',2,3,'שמור1');
INSERT INTO schedule_draft VALUES(471,'2025-08-02','שבת','שבת פתוחה',4,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(472,'2025-08-03','ראשון','רגיל',1,6,'שמור1');
INSERT INTO schedule_draft VALUES(473,'2025-08-04','שני','רגיל',12,2,'שמור1');
INSERT INTO schedule_draft VALUES(474,'2025-08-05','שלישי','רגיל',3,1,'שמור1');
INSERT INTO schedule_draft VALUES(475,'2025-08-06','רביעי','רגיל',6,12,'שמור1');
INSERT INTO schedule_draft VALUES(476,'2025-08-07','חמישי','רגיל',1,3,'שמור1');
INSERT INTO schedule_draft VALUES(477,'2025-08-08','שישי','שבת פתוחה',12,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(478,'2025-08-09','שבת','שבת סגורה',NULL,6,'שמור1');
INSERT INTO schedule_draft VALUES(479,'2025-08-10','ראשון','רגיל',4,1,'שמור1');
INSERT INTO schedule_draft VALUES(480,'2025-08-11','שני','רגיל',12,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(481,'2025-08-12','שלישי','רגיל',2,6,'שמור1');
INSERT INTO schedule_draft VALUES(482,'2025-08-13','רביעי','רגיל',4,12,'שמור1');
INSERT INTO schedule_draft VALUES(483,'2025-08-14','חמישי','רגיל',3,2,'שמור1');
INSERT INTO schedule_draft VALUES(484,'2025-08-15','שישי','שבת פתוחה',1,4,'שמור1');
INSERT INTO schedule_draft VALUES(485,'2025-08-16','שבת','שבת פתוחה',6,2,'שמור1');
INSERT INTO schedule_draft VALUES(486,'2025-08-17','ראשון','רגיל',4,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(487,'2025-08-18','שני','רגיל',2,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(488,'2025-08-19','שלישי','רגיל',3,6,'שמור1');
INSERT INTO schedule_draft VALUES(489,'2025-08-20','רביעי','רגיל',1,4,'שמור1');
INSERT INTO schedule_draft VALUES(490,'2025-08-21','חמישי','רגיל',12,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(491,'2025-08-22','שישי','שבת פתוחה',3,1,'שמור1');
INSERT INTO schedule_draft VALUES(492,'2025-08-23','שבת','שבת סגורה',NULL,2,'שמור1');
INSERT INTO schedule_draft VALUES(493,'2025-08-24','ראשון','רגיל',6,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(494,'2025-08-25','שני','רגיל',12,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(495,'2025-08-26','שלישי','רגיל',3,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(496,'2025-08-27','רביעי','רגיל',2,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(497,'2025-08-28','חמישי','רגיל',6,NULL,'שמור1');
INSERT INTO schedule_draft VALUES(498,'2025-08-29','שישי','שבת פתוחה',12,4,'שמור1');
INSERT INTO schedule_draft VALUES(499,'2025-08-30','שבת','שבת פתוחה',1,3,'שמור1');
INSERT INTO schedule_draft VALUES(500,'2025-08-31','ראשון','רגיל',4,NULL,'שמור1');
CREATE TABLE schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weekday TEXT NOT NULL,
    type TEXT NOT NULL,
    guide1_id INTEGER,
    guide2_id INTEGER
  , is_manual BOOLEAN DEFAULT 0, is_locked BOOLEAN DEFAULT 0, created_by INTEGER, created_at TEXT, updated_at TEXT, guide1_name TEXT, guide1_role TEXT, guide2_name TEXT, guide2_role TEXT, house_id VARCHAR(50) NOT NULL DEFAULT 'dror');
INSERT INTO schedule VALUES(827,'2025-07-01','שלישי','חפיפה',1,12,1,1,1,'2025-07-29 04:16:12',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(828,'2025-07-09','רביעי','חפיפה',6,4,1,1,1,'2025-07-29 04:16:19',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(829,'2025-07-23','רביעי','חפיפה',6,7,1,1,1,'2025-07-29 04:16:37',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(858,'2025-07-02','רביעי','רגיל',2,4,0,0,NULL,NULL,NULL,'תום','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(859,'2025-07-03','חמישי','רגיל',3,12,0,0,NULL,NULL,NULL,'שקד','רגיל','ליאור','חפיפה','dror');
INSERT INTO schedule VALUES(860,'2025-07-04','שישי','רגיל',1,6,0,0,NULL,NULL,NULL,'אלדד','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(861,'2025-07-05','שבת','רגיל',2,4,0,0,NULL,NULL,NULL,'תום','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(862,'2025-07-06','ראשון','רגיל',12,1,0,0,NULL,NULL,NULL,'ליאור','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(863,'2025-07-07','שני','רגיל',6,2,0,0,NULL,NULL,NULL,'יפתח','רגיל','תום','חפיפה','dror');
INSERT INTO schedule VALUES(864,'2025-07-08','שלישי','רגיל',3,4,0,0,NULL,NULL,NULL,'שקד','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(865,'2025-07-10','חמישי','רגיל',12,1,0,0,NULL,NULL,NULL,'ליאור','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(866,'2025-07-11','שישי','רגיל',2,3,0,0,NULL,NULL,NULL,'תום','רגיל','שקד','חפיפה','dror');
INSERT INTO schedule VALUES(867,'2025-07-12','שבת','רגיל',6,4,0,0,NULL,NULL,NULL,'יפתח','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(868,'2025-07-13','ראשון','רגיל',1,12,0,0,NULL,NULL,NULL,'אלדד','רגיל','ליאור','חפיפה','dror');
INSERT INTO schedule VALUES(869,'2025-07-14','שני','רגיל',2,6,0,0,NULL,NULL,NULL,'תום','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(870,'2025-07-15','שלישי','רגיל',3,4,0,0,NULL,NULL,NULL,'שקד','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(871,'2025-07-16','רביעי','רגיל',12,1,0,0,NULL,NULL,NULL,'ליאור','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(872,'2025-07-17','חמישי','רגיל',3,2,0,0,NULL,NULL,NULL,'שקד','רגיל','תום','חפיפה','dror');
INSERT INTO schedule VALUES(873,'2025-07-18','שישי','רגיל',6,4,0,0,NULL,NULL,NULL,'יפתח','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(874,'2025-07-19','שבת','רגיל',12,1,0,0,NULL,NULL,NULL,'ליאור','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(875,'2025-07-20','ראשון','רגיל',4,6,0,0,NULL,NULL,NULL,'עופרי','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(876,'2025-07-21','שני','רגיל',2,12,0,0,NULL,NULL,NULL,'תום','רגיל','ליאור','חפיפה','dror');
INSERT INTO schedule VALUES(877,'2025-07-22','שלישי','רגיל',3,1,0,0,NULL,NULL,NULL,'שקד','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(878,'2025-07-24','חמישי','רגיל',4,6,0,0,NULL,NULL,NULL,'עופרי','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(879,'2025-07-25','שישי','רגיל',2,3,0,0,NULL,NULL,NULL,'תום','רגיל','שקד','חפיפה','dror');
INSERT INTO schedule VALUES(880,'2025-07-26','שבת','רגיל',12,1,0,0,NULL,NULL,NULL,'ליאור','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(881,'2025-07-27','ראשון','רגיל',4,6,0,0,NULL,NULL,NULL,'עופרי','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(882,'2025-07-28','שני','רגיל',2,12,0,0,NULL,NULL,NULL,'תום','רגיל','ליאור','חפיפה','dror');
INSERT INTO schedule VALUES(883,'2025-07-29','שלישי','רגיל',3,1,0,0,NULL,NULL,NULL,'שקד','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(884,'2025-07-30','רביעי','רגיל',6,2,0,0,NULL,NULL,NULL,'יפתח','רגיל','תום','חפיפה','dror');
INSERT INTO schedule VALUES(885,'2025-07-31','חמישי','רגיל',4,3,0,0,NULL,NULL,NULL,'עופרי','רגיל','שקד','חפיפה','dror');
INSERT INTO schedule VALUES(917,'2025-08-01','שישי','חפיפה',3,4,1,1,1,'2025-07-29 13:39:16',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(918,'2025-08-02','שבת','חפיפה',2,5,1,1,1,'2025-07-29 13:39:28',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(919,'2025-08-03','ראשון','חפיפה',4,7,1,1,1,'2025-07-29 13:39:40',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(920,'2025-08-04','שני','חפיפה',6,5,1,1,1,'2025-07-29 13:39:55',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(921,'2025-08-05','שלישי','חפיפה',1,2,1,1,1,'2025-07-29 13:40:05',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(922,'2025-08-06','רביעי','חפיפה',6,12,1,1,1,'2025-07-29 13:40:11',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(923,'2025-08-07','חמישי','חפיפה',5,3,1,1,1,'2025-07-29 13:40:26',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(924,'2025-08-08','שישי','כונן',12,NULL,1,1,1,'2025-07-29 13:40:32',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(925,'2025-08-09','שבת','מוצ״ש',12,6,1,1,1,'2025-07-29 13:40:32','2025-07-29 13:40:38',NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(926,'2025-08-10','ראשון','חפיפה',4,1,1,1,1,'2025-07-29 13:40:53',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(927,'2025-08-11','שני','חפיפה',12,5,1,1,1,'2025-07-29 13:40:59',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(928,'2025-08-12','שלישי','חפיפה',4,6,1,1,1,'2025-07-29 13:41:21',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(929,'2025-08-13','רביעי','חפיפה',1,7,1,1,1,'2025-07-29 13:41:33',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(930,'2025-08-14','חמישי','חפיפה',3,2,1,1,1,'2025-07-29 13:41:37',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(931,'2025-08-15','שישי','חפיפה',12,4,1,1,1,'2025-07-29 13:41:49',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(932,'2025-08-16','שבת','חפיפה',6,2,1,1,1,'2025-07-29 13:41:56',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(933,'2025-08-17','ראשון','חפיפה',12,7,1,1,1,'2025-07-29 13:42:31',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(934,'2025-08-18','שני','חפיפה',2,4,1,1,1,'2025-07-29 13:42:40',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(935,'2025-08-19','שלישי','חפיפה',3,6,1,1,1,'2025-07-29 13:42:51',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(936,'2025-08-20','רביעי','חפיפה',1,4,1,1,1,'2025-07-29 13:43:02',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(937,'2025-08-21','חמישי','חפיפה',12,2,1,1,1,'2025-07-29 13:43:09',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(938,'2025-08-22','שישי','כונן',3,NULL,1,1,1,'2025-07-29 13:43:19',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(939,'2025-08-23','שבת','מוצ״ש',3,2,1,1,1,'2025-07-29 13:43:19','2025-07-29 13:43:31',NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(940,'2025-08-24','ראשון','חפיפה',6,1,1,1,1,'2025-07-29 13:43:44',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(941,'2025-08-25','שני','חפיפה',12,2,1,1,1,'2025-07-29 13:43:50',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(942,'2025-08-26','שלישי','חפיפה',3,1,1,1,1,'2025-07-29 13:43:59',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(943,'2025-08-27','רביעי','חפיפה',2,7,1,1,1,'2025-07-29 13:44:04',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(944,'2025-08-28','חמישי','חפיפה',6,3,1,1,1,'2025-07-29 13:44:17',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(945,'2025-08-29','שישי','חפיפה',7,1,1,1,1,'2025-07-29 13:44:23',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(946,'2025-08-30','שבת','חפיפה',1,6,1,1,1,'2025-07-29 13:44:39',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(947,'2025-08-31','ראשון','חפיפה',4,12,1,1,1,'2025-07-29 13:44:47',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(1008,'2025-10-06','שני','חפיפה',7,5,1,1,1,'2025-08-05 18:01:15',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(1009,'2025-10-07','שלישי','חפיפה',1,12,1,1,1,'2025-08-05 18:01:26',NULL,NULL,NULL,NULL,NULL,'dror');
INSERT INTO schedule VALUES(1010,'2025-10-01','רביעי','רגיל',2,4,0,0,NULL,NULL,NULL,'תום','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(1011,'2025-10-02','חמישי','רגיל',3,6,0,0,NULL,NULL,NULL,'שקד','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(1012,'2025-10-03','שישי','רגיל',12,NULL,0,0,NULL,NULL,NULL,'ליאור','כונן',NULL,NULL,'dror');
INSERT INTO schedule VALUES(1013,'2025-10-04','שבת','רגיל',1,NULL,0,0,NULL,NULL,NULL,'אלדד','מוצ״ש',NULL,NULL,'dror');
INSERT INTO schedule VALUES(1014,'2025-10-05','ראשון','רגיל',4,6,0,0,NULL,NULL,NULL,'עופרי','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(1015,'2025-10-08','רביעי','רגיל',2,1,0,0,NULL,NULL,NULL,'תום','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(1016,'2025-10-09','חמישי','רגיל',3,4,0,0,NULL,NULL,NULL,'שקד','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(1017,'2025-10-10','שישי','רגיל',12,6,0,0,NULL,NULL,NULL,'ליאור','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(1018,'2025-10-11','שבת','רגיל',2,1,0,0,NULL,NULL,NULL,'תום','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(1019,'2025-10-12','ראשון','רגיל',4,12,0,0,NULL,NULL,NULL,'עופרי','רגיל','ליאור','חפיפה','dror');
INSERT INTO schedule VALUES(1020,'2025-10-13','שני','רגיל',6,2,0,0,NULL,NULL,NULL,'יפתח','רגיל','תום','חפיפה','dror');
INSERT INTO schedule VALUES(1021,'2025-10-14','שלישי','רגיל',3,1,0,0,NULL,NULL,NULL,'שקד','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(1022,'2025-10-15','רביעי','רגיל',12,4,0,0,NULL,NULL,NULL,'ליאור','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(1023,'2025-10-16','חמישי','רגיל',3,2,0,0,NULL,NULL,NULL,'שקד','רגיל','תום','חפיפה','dror');
INSERT INTO schedule VALUES(1024,'2025-10-17','שישי','רגיל',6,NULL,0,0,NULL,NULL,NULL,'יפתח','כונן',NULL,NULL,'dror');
INSERT INTO schedule VALUES(1025,'2025-10-18','שבת','רגיל',1,NULL,0,0,NULL,NULL,NULL,'אלדד','מוצ״ש',NULL,NULL,'dror');
INSERT INTO schedule VALUES(1026,'2025-10-19','ראשון','רגיל',12,4,0,0,NULL,NULL,NULL,'ליאור','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(1027,'2025-10-20','שני','רגיל',2,6,0,0,NULL,NULL,NULL,'תום','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(1028,'2025-10-21','שלישי','רגיל',3,1,0,0,NULL,NULL,NULL,'שקד','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(1029,'2025-10-22','רביעי','רגיל',12,4,0,0,NULL,NULL,NULL,'ליאור','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(1030,'2025-10-23','חמישי','רגיל',2,6,0,0,NULL,NULL,NULL,'תום','רגיל','יפתח','חפיפה','dror');
INSERT INTO schedule VALUES(1031,'2025-10-24','שישי','רגיל',3,1,0,0,NULL,NULL,NULL,'שקד','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(1032,'2025-10-25','שבת','רגיל',4,12,0,0,NULL,NULL,NULL,'עופרי','רגיל','ליאור','חפיפה','dror');
INSERT INTO schedule VALUES(1033,'2025-10-26','ראשון','רגיל',6,1,0,0,NULL,NULL,NULL,'יפתח','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(1034,'2025-10-27','שני','רגיל',2,4,0,0,NULL,NULL,NULL,'תום','רגיל','עופרי','חפיפה','dror');
INSERT INTO schedule VALUES(1035,'2025-10-28','שלישי','רגיל',3,12,0,0,NULL,NULL,NULL,'שקד','רגיל','ליאור','חפיפה','dror');
INSERT INTO schedule VALUES(1036,'2025-10-29','רביעי','רגיל',6,1,0,0,NULL,NULL,NULL,'יפתח','רגיל','אלדד','חפיפה','dror');
INSERT INTO schedule VALUES(1037,'2025-10-30','חמישי','רגיל',3,2,0,0,NULL,NULL,NULL,'שקד','רגיל','תום','חפיפה','dror');
INSERT INTO schedule VALUES(1038,'2025-10-31','שישי','רגיל',4,NULL,0,0,NULL,NULL,NULL,'עופרי','כונן',NULL,NULL,'dror');
CREATE TABLE shifts (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    day TEXT NOT NULL,
    handover_guide_id INTEGER,
    regular_guide_id INTEGER
  );
INSERT INTO shifts VALUES(1752331379240,'14/7/25','שני',NULL,NULL);
INSERT INTO shifts VALUES(1752331379241,'15/7/25','שלישי',NULL,NULL);
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TEXT,
    creator_id INTEGER,
    assigned_to_id INTEGER,
    status TEXT,
    shift_date TEXT,
    notes TEXT,
    closed_by_id INTEGER,
    closed_at TEXT
  , house_id VARCHAR(50) NOT NULL DEFAULT 'dror');
INSERT INTO tasks VALUES(1,'חפיפה: בדיקת תקינות מטבח','2025-07-13T09:10:00',6,1,'בוצע','2025-07-13','',NULL,'2025-07-12T19:31:54.558Z','dror');
INSERT INTO tasks VALUES(1752665662527,'נסיון בדיקה 9','2025-07-21T09:07:14.235Z',10,NULL,'בוצע','2025-07-21',NULL,10,'2025-07-29T07:47:07.827Z','dror');
INSERT INTO tasks VALUES(1752665662528,'חפיפה: יוני יוצא לפגישה לגבי טיפולי המשך בשעה 12:00, חוזר בערב','2025-07-29T07:47:05.983Z',10,NULL,'פתוחה','2025-07-29',NULL,NULL,NULL,'dror');
INSERT INTO tasks VALUES(1752665662529,'חפיפה : משה, בדיקות דם 1','2025-07-29T07:47:13.015Z',10,NULL,'פתוחה','2025-07-29',NULL,NULL,NULL,'dror');
INSERT INTO tasks VALUES(1752665662530,'חפיפה : אלווין, בדיקות דם','2025-07-29T07:51:23.148Z',10,NULL,'פתוחה','2025-07-29',NULL,NULL,NULL,'dror');
CREATE TABLE weekly_activities (
    id INTEGER PRIMARY KEY,
    weekday TEXT NOT NULL,
    time TEXT NOT NULL,
    duration TEXT,
    title TEXT NOT NULL,
    category TEXT,
    facilitator TEXT
  );
INSERT INTO weekly_activities VALUES(1720802053887,'ראשון','09:00','','קבוצת בוקר','טיפולית','איילה');
INSERT INTO weekly_activities VALUES(1752377131189,'ראשון','11:30','','אמנות','אומנות','טיטה');
INSERT INTO weekly_activities VALUES(1752377192856,'שני','09:00','','קבוצת בוקר','טיפולית','מירי');
INSERT INTO weekly_activities VALUES(1752377254080,'שלישי','09:00','','קבוצת בוקר','טיפולית','סיגל');
INSERT INTO weekly_activities VALUES(1752377279560,'רביעי','09:00','','קבוצת בוקר','טיפולית','יסמין');
INSERT INTO weekly_activities VALUES(1752377301933,'חמישי','09:00','','קבוצת בוקר','טיפולית','שי לי');
INSERT INTO weekly_activities VALUES(1752377319958,'שישי','09:00','','קבוצת סופ״ש','טיפולית','מדריך');
INSERT INTO weekly_activities VALUES(1752377355332,'רביעי','11:15','','קבוצת כתיבה','טיפולית','דביר');
INSERT INTO weekly_activities VALUES(1752377379127,'רביעי','15:00','','קבוצת יצירה והבעה','אומנות','חן');
INSERT INTO weekly_activities VALUES(1752379558312,'שלישי','11:00','','יוגה','פיזית','מיכל');
INSERT INTO weekly_activities VALUES(1752379581247,'שני','11:15','','אימון גופני','פיזית','תכלת');
INSERT INTO weekly_activities VALUES(1752379606289,'ראשון','17:00','','קבוצת מדריך','אחר','מדריך');
INSERT INTO weekly_activities VALUES(1752379625882,'שני','17:00','','קבוצת מדריך','אחר','מדריך');
INSERT INTO weekly_activities VALUES(1752379665555,'שלישי','17:00','','קבוצת מדריך','אחר','מדריך');
INSERT INTO weekly_activities VALUES(1752379684651,'רביעי','17:00','','קבוצת מדריך','אחר','מדריך');
CREATE TABLE scheduling_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'manual_only' or 'prevent_pair'
    guide_id INTEGER NOT NULL,
    guide2_id INTEGER, -- nullable, only for prevent_pair
    created_by INTEGER,
    created_at TEXT,
    description TEXT
  );
INSERT INTO scheduling_rules VALUES(1,'manual_only',7,NULL,8,'2025-07-20T06:56:08.938Z','');
INSERT INTO scheduling_rules VALUES(3,'manual_only',5,NULL,10,'2025-07-20T09:16:50.832Z','');
INSERT INTO scheduling_rules VALUES(4,'prevent_pair',12,5,10,'2025-07-21T04:12:18.499Z','');
INSERT INTO scheduling_rules VALUES(6,'no_oncall',1,NULL,10,'2025-07-21T06:16:12.399Z','');
INSERT INTO scheduling_rules VALUES(8,'manual_weekend_consecutive',1,NULL,10,'2025-07-22T02:59:19.006Z','');
CREATE TABLE shabbat_status (
    date TEXT PRIMARY KEY, -- שבת date (YYYY-MM-DD)
    status TEXT NOT NULL -- 'סגורה' or 'פתוחה'
  );
INSERT INTO shabbat_status VALUES('2025-08-09','סגורה');
INSERT INTO shabbat_status VALUES('2025-08-23','סגורה');
CREATE TABLE drafts (id INTEGER PRIMARY KEY AUTOINCREMENT, month TEXT NOT NULL, version INTEGER NOT NULL, name TEXT NOT NULL, data TEXT NOT NULL, created_by INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_final BOOLEAN DEFAULT 0, approved_at TEXT, approved_by INTEGER);
INSERT INTO drafts VALUES(4,'2025-07',1,'Draft 1 - 29.7.2025','[{"id":796,"date":"2025-07-01","weekday":"שלישי","type":"רגיל","guide1_id":4,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":797,"date":"2025-07-02","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":798,"date":"2025-07-03","weekday":"חמישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":799,"date":"2025-07-04","weekday":"שישי","type":"רגיל","guide1_id":12,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":800,"date":"2025-07-05","weekday":"שבת","type":"רגיל","guide1_id":2,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":801,"date":"2025-07-06","weekday":"ראשון","type":"רגיל","guide1_id":1,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":802,"date":"2025-07-07","weekday":"שני","type":"רגיל","guide1_id":12,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":803,"date":"2025-07-08","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":804,"date":"2025-07-09","weekday":"רביעי","type":"רגיל","guide1_id":1,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":805,"date":"2025-07-10","weekday":"חמישי","type":"רגיל","guide1_id":2,"guide2_id":3,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"שקד","guide2_role":"חפיפה"},{"id":806,"date":"2025-07-11","weekday":"שישי","type":"רגיל","guide1_id":12,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":807,"date":"2025-07-12","weekday":"שבת","type":"רגיל","guide1_id":1,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":808,"date":"2025-07-13","weekday":"ראשון","type":"רגיל","guide1_id":12,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":809,"date":"2025-07-14","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":810,"date":"2025-07-15","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":811,"date":"2025-07-16","weekday":"רביעי","type":"רגיל","guide1_id":12,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":812,"date":"2025-07-17","weekday":"חמישי","type":"רגיל","guide1_id":3,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":813,"date":"2025-07-18","weekday":"שישי","type":"רגיל","guide1_id":4,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":814,"date":"2025-07-19","weekday":"שבת","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":815,"date":"2025-07-20","weekday":"ראשון","type":"רגיל","guide1_id":6,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":816,"date":"2025-07-21","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":817,"date":"2025-07-22","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":818,"date":"2025-07-23","weekday":"רביעי","type":"רגיל","guide1_id":1,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":819,"date":"2025-07-24","weekday":"חמישי","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":820,"date":"2025-07-25","weekday":"שישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":821,"date":"2025-07-26","weekday":"שבת","type":"רגיל","guide1_id":6,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":822,"date":"2025-07-27","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":823,"date":"2025-07-28","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":824,"date":"2025-07-29","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":825,"date":"2025-07-30","weekday":"רביעי","type":"רגיל","guide1_id":4,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":826,"date":"2025-07-31","weekday":"חמישי","type":"רגיל","guide1_id":2,"guide2_id":3,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"שקד","guide2_role":"חפיפה"}]',1,'2025-07-29 04:15:45',0,NULL,NULL);
INSERT INTO drafts VALUES(5,'2025-07',2,'Draft 2 - 29.7.2025','[{"id":827,"date":"2025-07-01","weekday":"שלישי","type":"חפיפה","guide1_id":1,"guide2_id":12,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 04:16:12","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"ליאור","guide2_role":null},{"id":830,"date":"2025-07-02","weekday":"רביעי","type":"רגיל","guide1_id":2,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":831,"date":"2025-07-03","weekday":"חמישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":832,"date":"2025-07-04","weekday":"שישי","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":833,"date":"2025-07-05","weekday":"שבת","type":"רגיל","guide1_id":2,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":834,"date":"2025-07-06","weekday":"ראשון","type":"רגיל","guide1_id":1,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":835,"date":"2025-07-07","weekday":"שני","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":836,"date":"2025-07-08","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":828,"date":"2025-07-09","weekday":"רביעי","type":"חפיפה","guide1_id":6,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 04:16:19","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":837,"date":"2025-07-10","weekday":"חמישי","type":"רגיל","guide1_id":4,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":838,"date":"2025-07-11","weekday":"שישי","type":"רגיל","guide1_id":3,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":839,"date":"2025-07-12","weekday":"שבת","type":"רגיל","guide1_id":12,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":840,"date":"2025-07-13","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":841,"date":"2025-07-14","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":842,"date":"2025-07-15","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":843,"date":"2025-07-16","weekday":"רביעי","type":"רגיל","guide1_id":4,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":844,"date":"2025-07-17","weekday":"חמישי","type":"רגיל","guide1_id":3,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":845,"date":"2025-07-18","weekday":"שישי","type":"רגיל","guide1_id":6,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":846,"date":"2025-07-19","weekday":"שבת","type":"רגיל","guide1_id":4,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":847,"date":"2025-07-20","weekday":"ראשון","type":"רגיל","guide1_id":12,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":848,"date":"2025-07-21","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":849,"date":"2025-07-22","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":829,"date":"2025-07-23","weekday":"רביעי","type":"חפיפה","guide1_id":6,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 04:16:37","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":850,"date":"2025-07-24","weekday":"חמישי","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":851,"date":"2025-07-25","weekday":"שישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":852,"date":"2025-07-26","weekday":"שבת","type":"רגיל","guide1_id":1,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":853,"date":"2025-07-27","weekday":"ראשון","type":"רגיל","guide1_id":6,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":854,"date":"2025-07-28","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":855,"date":"2025-07-29","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":856,"date":"2025-07-30","weekday":"רביעי","type":"רגיל","guide1_id":2,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":857,"date":"2025-07-31","weekday":"חמישי","type":"רגיל","guide1_id":3,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"}]',1,'2025-07-29 04:16:50',0,NULL,NULL);
INSERT INTO drafts VALUES(6,'2025-08',1,'Draft 1 - 29.7.2025','[{"id":917,"date":"2025-08-01","weekday":"שישי","type":"חפיפה","guide1_id":3,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:16","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":918,"date":"2025-08-02","weekday":"שבת","type":"חפיפה","guide1_id":2,"guide2_id":5,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:28","updated_at":null,"guide1_name":"תום","guide1_role":null,"guide2_name":"עמית","guide2_role":null},{"id":919,"date":"2025-08-03","weekday":"ראשון","type":"חפיפה","guide1_id":4,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:40","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":920,"date":"2025-08-04","weekday":"שני","type":"חפיפה","guide1_id":6,"guide2_id":5,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:55","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"עמית","guide2_role":null},{"id":921,"date":"2025-08-05","weekday":"שלישי","type":"חפיפה","guide1_id":1,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:05","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":922,"date":"2025-08-06","weekday":"רביעי","type":"חפיפה","guide1_id":6,"guide2_id":12,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:11","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"ליאור","guide2_role":null},{"id":923,"date":"2025-08-07","weekday":"חמישי","type":"חפיפה","guide1_id":5,"guide2_id":3,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:26","updated_at":null,"guide1_name":"עמית","guide1_role":null,"guide2_name":"שקד","guide2_role":null},{"id":924,"date":"2025-08-08","weekday":"שישי","type":"כונן","guide1_id":12,"guide2_id":null,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:32","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":null,"guide2_role":null},{"id":925,"date":"2025-08-09","weekday":"שבת","type":"מוצ״ש","guide1_id":12,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:32","updated_at":"2025-07-29 13:40:38","guide1_name":"ליאור","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":926,"date":"2025-08-10","weekday":"ראשון","type":"חפיפה","guide1_id":4,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:53","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":927,"date":"2025-08-11","weekday":"שני","type":"חפיפה","guide1_id":12,"guide2_id":5,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:59","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"עמית","guide2_role":null},{"id":928,"date":"2025-08-12","weekday":"שלישי","type":"חפיפה","guide1_id":4,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:21","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":929,"date":"2025-08-13","weekday":"רביעי","type":"חפיפה","guide1_id":1,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:33","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":930,"date":"2025-08-14","weekday":"חמישי","type":"חפיפה","guide1_id":3,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:37","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":931,"date":"2025-08-15","weekday":"שישי","type":"חפיפה","guide1_id":12,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:49","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":932,"date":"2025-08-16","weekday":"שבת","type":"חפיפה","guide1_id":6,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:56","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":933,"date":"2025-08-17","weekday":"ראשון","type":"חפיפה","guide1_id":12,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:42:31","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":934,"date":"2025-08-18","weekday":"שני","type":"חפיפה","guide1_id":2,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:42:40","updated_at":null,"guide1_name":"תום","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":935,"date":"2025-08-19","weekday":"שלישי","type":"חפיפה","guide1_id":3,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:42:51","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":936,"date":"2025-08-20","weekday":"רביעי","type":"חפיפה","guide1_id":1,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:02","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":937,"date":"2025-08-21","weekday":"חמישי","type":"חפיפה","guide1_id":12,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:09","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":938,"date":"2025-08-22","weekday":"שישי","type":"כונן","guide1_id":3,"guide2_id":null,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:19","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":null,"guide2_role":null},{"id":939,"date":"2025-08-23","weekday":"שבת","type":"מוצ״ש","guide1_id":3,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:19","updated_at":"2025-07-29 13:43:31","guide1_name":"שקד","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":940,"date":"2025-08-24","weekday":"ראשון","type":"חפיפה","guide1_id":6,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:44","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":941,"date":"2025-08-25","weekday":"שני","type":"חפיפה","guide1_id":12,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:50","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":942,"date":"2025-08-26","weekday":"שלישי","type":"חפיפה","guide1_id":3,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:59","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":943,"date":"2025-08-27","weekday":"רביעי","type":"חפיפה","guide1_id":2,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:04","updated_at":null,"guide1_name":"תום","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":944,"date":"2025-08-28","weekday":"חמישי","type":"חפיפה","guide1_id":6,"guide2_id":3,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:17","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"שקד","guide2_role":null},{"id":945,"date":"2025-08-29","weekday":"שישי","type":"חפיפה","guide1_id":7,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:23","updated_at":null,"guide1_name":"רפאל","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":946,"date":"2025-08-30","weekday":"שבת","type":"חפיפה","guide1_id":1,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:39","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":947,"date":"2025-08-31","weekday":"ראשון","type":"חפיפה","guide1_id":4,"guide2_id":12,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:47","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"ליאור","guide2_role":null}]',1,'2025-07-29 13:44:58',0,NULL,NULL);
INSERT INTO drafts VALUES(7,'2025-09',1,'Draft 1 - 5.8.2025','[{"id":978,"date":"2025-09-01","weekday":"שני","type":"חפיפה","guide1_id":6,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-08-05 17:48:17","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":979,"date":"2025-09-02","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":980,"date":"2025-09-03","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":981,"date":"2025-09-04","weekday":"חמישי","type":"רגיל","guide1_id":12,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":982,"date":"2025-09-05","weekday":"שישי","type":"רגיל","guide1_id":3,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"כונן","guide2_name":null,"guide2_role":null},{"id":983,"date":"2025-09-06","weekday":"שבת","type":"רגיל","guide1_id":1,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"מוצ״ש","guide2_name":null,"guide2_role":null},{"id":984,"date":"2025-09-07","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":985,"date":"2025-09-08","weekday":"שני","type":"רגיל","guide1_id":12,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":986,"date":"2025-09-09","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":987,"date":"2025-09-10","weekday":"רביעי","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":988,"date":"2025-09-11","weekday":"חמישי","type":"רגיל","guide1_id":12,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":989,"date":"2025-09-12","weekday":"שישי","type":"רגיל","guide1_id":1,"guide2_id":3,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"שקד","guide2_role":"חפיפה"},{"id":990,"date":"2025-09-13","weekday":"שבת","type":"רגיל","guide1_id":4,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":991,"date":"2025-09-14","weekday":"ראשון","type":"רגיל","guide1_id":6,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":992,"date":"2025-09-15","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":993,"date":"2025-09-16","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":994,"date":"2025-09-17","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":995,"date":"2025-09-18","weekday":"חמישי","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":996,"date":"2025-09-19","weekday":"שישי","type":"רגיל","guide1_id":3,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"כונן","guide2_name":null,"guide2_role":null},{"id":997,"date":"2025-09-20","weekday":"שבת","type":"רגיל","guide1_id":12,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"מוצ״ש","guide2_name":null,"guide2_role":null},{"id":998,"date":"2025-09-21","weekday":"ראשון","type":"רגיל","guide1_id":1,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":999,"date":"2025-09-22","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":1000,"date":"2025-09-23","weekday":"שלישי","type":"רגיל","guide1_id":12,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":1001,"date":"2025-09-24","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":1002,"date":"2025-09-25","weekday":"חמישי","type":"רגיל","guide1_id":4,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":1003,"date":"2025-09-26","weekday":"שישי","type":"רגיל","guide1_id":1,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":1004,"date":"2025-09-27","weekday":"שבת","type":"רגיל","guide1_id":2,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":1005,"date":"2025-09-28","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":1006,"date":"2025-09-29","weekday":"שני","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":1007,"date":"2025-09-30","weekday":"שלישי","type":"רגיל","guide1_id":12,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"}]',1,'2025-08-05 17:50:13',0,NULL,NULL);
CREATE TABLE guide_availability (id INTEGER PRIMARY KEY AUTOINCREMENT, guide_id INTEGER NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, reason TEXT, override_enabled BOOLEAN DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (guide_id) REFERENCES users(id));
CREATE TABLE assignment_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, hours_per_shift INTEGER DEFAULT 24, salary_factor REAL DEFAULT 1.0, is_active BOOLEAN DEFAULT 1);
INSERT INTO assignment_types VALUES(1,'רגיל','משמרת רגילה 09:00-09:00',24,1.0,1);
INSERT INTO assignment_types VALUES(2,'חפיפה','משמרת חפיפה 09:00-10:00 למחרת',25,1.0400000000000000355,1);
INSERT INTO assignment_types VALUES(3,'כונן','כונן שבת סגורה',32,1.330000000000000071,1);
INSERT INTO assignment_types VALUES(4,'מוצ״ש','מוצאי שבת - שבת 17:00 עד ראשון 09:00',24,1.0,1);
CREATE TABLE shift_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, guides_required INTEGER DEFAULT 2, roles_required TEXT, is_active BOOLEAN DEFAULT 1);
INSERT INTO shift_types VALUES(1,'weekday','יום חול רגיל',2,'["רגיל", "חפיפה"]',1);
INSERT INTO shift_types VALUES(2,'weekend_open','סוף שבוע פתוח',2,'["רגיל", "חפיפה"]',1);
INSERT INTO shift_types VALUES(3,'weekend_closed','סוף שבוע סגור',1,'["כונן"]',1);
INSERT INTO shift_types VALUES(4,'holiday','חג',2,'["רגיל", "חפיפה"]',1);
CREATE TABLE audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, record_id INTEGER, action TEXT NOT NULL, old_values TEXT, new_values TEXT, user_id INTEGER, timestamp TEXT DEFAULT CURRENT_TIMESTAMP, ip_address TEXT, user_agent TEXT);
INSERT INTO audit_log VALUES(1,'schedule',94,'create_manual',NULL,'{"date":"2025-07-31","guide1_id":1,"guide2_id":6,"type":"רגיל","created_by":1}',1,'2025-07-27 07:07:17',NULL,NULL);
INSERT INTO audit_log VALUES(2,'schedule',95,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"רגיל","created_by":1}',1,'2025-07-27 07:22:44',NULL,NULL);
INSERT INTO audit_log VALUES(3,'schedule',96,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"type":"רגיל","created_by":1}',1,'2025-07-27 07:24:25',NULL,NULL);
INSERT INTO audit_log VALUES(4,'schedule',96,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":5,"type":"רגיל","created_by":1}',1,'2025-07-27 07:24:33',NULL,NULL);
INSERT INTO audit_log VALUES(5,'schedule',96,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"type":"רגיל","created_by":1}',1,'2025-07-27 07:24:47',NULL,NULL);
INSERT INTO audit_log VALUES(6,'schedule',97,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":1,"type":"רגיל","created_by":1}',1,'2025-07-27 07:36:50',NULL,NULL);
INSERT INTO audit_log VALUES(7,'schedule',97,'create_manual',NULL,'{"date":"2025-08-08","type":"רגיל","created_by":1}',1,'2025-07-27 07:37:02',NULL,NULL);
INSERT INTO audit_log VALUES(8,'schedule',96,'create_manual',NULL,'{"date":"2025-08-02","type":"רגיל","created_by":1}',1,'2025-07-27 07:37:07',NULL,NULL);
INSERT INTO audit_log VALUES(9,'schedule',96,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 07:42:05',NULL,NULL);
INSERT INTO audit_log VALUES(10,'schedule',98,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":1,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 07:47:16',NULL,NULL);
INSERT INTO audit_log VALUES(11,'schedule',98,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":1,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 07:51:16',NULL,NULL);
INSERT INTO audit_log VALUES(12,'schedule',98,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 07:52:23',NULL,NULL);
INSERT INTO audit_log VALUES(13,'schedule',98,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 07:59:18',NULL,NULL);
INSERT INTO audit_log VALUES(14,'schedule',98,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":1,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 08:00:43',NULL,NULL);
INSERT INTO audit_log VALUES(15,'schedule',98,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 08:08:53',NULL,NULL);
INSERT INTO audit_log VALUES(16,'schedule',99,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":12,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 08:14:59',NULL,NULL);
INSERT INTO audit_log VALUES(17,'schedule',97,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 09:41:11',NULL,NULL);
INSERT INTO audit_log VALUES(18,'schedule',95,'create_manual',NULL,'{"date":"2025-08-01","type":"רגיל","created_by":1}',1,'2025-07-27 09:57:29',NULL,NULL);
INSERT INTO audit_log VALUES(19,'schedule',100,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:13:09',NULL,NULL);
INSERT INTO audit_log VALUES(20,'schedule',101,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":1,"type":"כונן","created_by":1}',1,'2025-07-27 10:13:19',NULL,NULL);
INSERT INTO audit_log VALUES(21,'schedule',102,'create_manual',NULL,'{"date":"2025-08-11","guide1_id":12,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:13:26',NULL,NULL);
INSERT INTO audit_log VALUES(22,'schedule',103,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":1,"guide2_id":12,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:13:40',NULL,NULL);
INSERT INTO audit_log VALUES(23,'schedule',104,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":6,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:13:45',NULL,NULL);
INSERT INTO audit_log VALUES(24,'schedule',105,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:27:16',NULL,NULL);
INSERT INTO audit_log VALUES(25,'schedule',106,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":6,"type":"רגיל","created_by":1}',1,'2025-07-27 10:31:11',NULL,NULL);
INSERT INTO audit_log VALUES(26,'schedule',107,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:31:26',NULL,NULL);
INSERT INTO audit_log VALUES(27,'schedule',107,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":1,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:31:38',NULL,NULL);
INSERT INTO audit_log VALUES(28,'schedule',108,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 10:32:04',NULL,NULL);
INSERT INTO audit_log VALUES(29,'schedule',108,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":1,"type":"כונן","created_by":1}',1,'2025-07-27 10:32:23',NULL,NULL);
INSERT INTO audit_log VALUES(30,'schedule',108,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 10:32:32',NULL,NULL);
INSERT INTO audit_log VALUES(31,'schedule',109,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":1,"guide2_id":null,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:41:58',NULL,NULL);
INSERT INTO audit_log VALUES(32,'schedule',108,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 10:43:08',NULL,NULL);
INSERT INTO audit_log VALUES(33,'schedule',110,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 10:43:08',NULL,NULL);
INSERT INTO audit_log VALUES(34,'schedule',110,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":3,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:43:16',NULL,NULL);
INSERT INTO audit_log VALUES(35,'schedule',111,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:48:49',NULL,NULL);
INSERT INTO audit_log VALUES(36,'schedule',112,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":1,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:48:55',NULL,NULL);
INSERT INTO audit_log VALUES(37,'schedule',113,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:49:01',NULL,NULL);
INSERT INTO audit_log VALUES(38,'schedule',114,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 10:49:10',NULL,NULL);
INSERT INTO audit_log VALUES(39,'schedule',115,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 10:49:10',NULL,NULL);
INSERT INTO audit_log VALUES(40,'schedule',115,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":3,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:49:20',NULL,NULL);
INSERT INTO audit_log VALUES(41,'schedule',113,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":1,"guide2_id":null,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:52:41',NULL,NULL);
INSERT INTO audit_log VALUES(42,'schedule',111,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":2,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 10:52:48',NULL,NULL);
INSERT INTO audit_log VALUES(43,'schedule',113,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":3,"guide2_id":null,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:53:14',NULL,NULL);
INSERT INTO audit_log VALUES(44,'schedule',113,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":4,"guide2_id":null,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:57:35',NULL,NULL);
INSERT INTO audit_log VALUES(45,'schedule',116,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 10:58:44',NULL,NULL);
INSERT INTO audit_log VALUES(46,'schedule',117,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 10:58:44',NULL,NULL);
INSERT INTO audit_log VALUES(47,'schedule',117,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":3,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:58:55',NULL,NULL);
INSERT INTO audit_log VALUES(48,'schedule',116,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":5,"type":"כונן","created_by":1}',1,'2025-07-27 10:59:05',NULL,NULL);
INSERT INTO audit_log VALUES(49,'schedule',117,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":5,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 10:59:05',NULL,NULL);
INSERT INTO audit_log VALUES(50,'schedule',116,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 10:59:10',NULL,NULL);
INSERT INTO audit_log VALUES(51,'schedule',117,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 10:59:10',NULL,NULL);
INSERT INTO audit_log VALUES(52,'schedule',117,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":3,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 10:59:22',NULL,NULL);
INSERT INTO audit_log VALUES(53,'schedule',118,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":1,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:59:32',NULL,NULL);
INSERT INTO audit_log VALUES(54,'schedule',119,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":12,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:59:46',NULL,NULL);
INSERT INTO audit_log VALUES(55,'schedule',120,'create_manual',NULL,'{"date":"2025-08-05","guide1_id":6,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 10:59:57',NULL,NULL);
INSERT INTO audit_log VALUES(56,'schedule',121,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:00:09',NULL,NULL);
INSERT INTO audit_log VALUES(57,'schedule',122,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:00:22',NULL,NULL);
INSERT INTO audit_log VALUES(58,'schedule',147,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 11:20:22',NULL,NULL);
INSERT INTO audit_log VALUES(59,'schedule',148,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 11:20:22',NULL,NULL);
INSERT INTO audit_log VALUES(60,'schedule',148,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":3,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 11:20:29',NULL,NULL);
INSERT INTO audit_log VALUES(61,'schedule',205,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:29:57',NULL,NULL);
INSERT INTO audit_log VALUES(62,'schedule',206,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:30:05',NULL,NULL);
INSERT INTO audit_log VALUES(63,'schedule',207,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:30:57',NULL,NULL);
INSERT INTO audit_log VALUES(64,'schedule',208,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":6,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:31:11',NULL,NULL);
INSERT INTO audit_log VALUES(65,'schedule',209,'create_manual',NULL,'{"date":"2025-08-05","guide1_id":1,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:31:24',NULL,NULL);
INSERT INTO audit_log VALUES(66,'schedule',210,'create_manual',NULL,'{"date":"2025-08-06","guide1_id":6,"guide2_id":12,"type":"חפיפה","created_by":1}',1,'2025-07-27 11:31:43',NULL,NULL);
INSERT INTO audit_log VALUES(67,'schedule',264,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 12:02:14',NULL,NULL);
INSERT INTO audit_log VALUES(68,'schedule',343,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:16:44',NULL,NULL);
INSERT INTO audit_log VALUES(69,'schedule',344,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:16:49',NULL,NULL);
INSERT INTO audit_log VALUES(70,'schedule',345,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:17:15',NULL,NULL);
INSERT INTO audit_log VALUES(71,'schedule',346,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":6,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:17:22',NULL,NULL);
INSERT INTO audit_log VALUES(72,'schedule',347,'create_manual',NULL,'{"date":"2025-08-05","guide1_id":1,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:17:49',NULL,NULL);
INSERT INTO audit_log VALUES(73,'schedule',348,'create_manual',NULL,'{"date":"2025-08-06","guide1_id":6,"guide2_id":12,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:17:55',NULL,NULL);
INSERT INTO audit_log VALUES(74,'schedule',349,'create_manual',NULL,'{"date":"2025-08-07","guide1_id":5,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:18:08',NULL,NULL);
INSERT INTO audit_log VALUES(75,'schedule',350,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 16:18:13',NULL,NULL);
INSERT INTO audit_log VALUES(76,'schedule',351,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 16:18:13',NULL,NULL);
INSERT INTO audit_log VALUES(77,'schedule',351,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":6,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 16:18:18',NULL,NULL);
INSERT INTO audit_log VALUES(78,'schedule',352,'create_manual',NULL,'{"date":"2025-08-11","guide1_id":5,"type":"רגיל","created_by":1}',1,'2025-07-27 16:18:51',NULL,NULL);
INSERT INTO audit_log VALUES(79,'schedule',353,'create_manual',NULL,'{"date":"2025-08-13","guide1_id":1,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:19:14',NULL,NULL);
INSERT INTO audit_log VALUES(80,'schedule',354,'create_manual',NULL,'{"date":"2025-08-17","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:19:34',NULL,NULL);
INSERT INTO audit_log VALUES(81,'schedule',355,'create_manual',NULL,'{"date":"2025-08-27","guide1_id":2,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:20:16',NULL,NULL);
INSERT INTO audit_log VALUES(82,'schedule',356,'create_manual',NULL,'{"date":"2025-08-29","guide1_id":7,"guide2_id":1,"type":"חפיפה","created_by":1}',1,'2025-07-27 16:20:23',NULL,NULL);
INSERT INTO audit_log VALUES(83,'schedule',407,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":6,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 17:13:57',NULL,NULL);
INSERT INTO audit_log VALUES(84,'schedule',408,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":5,"type":"רגיל","created_by":1}',1,'2025-07-27 17:14:04',NULL,NULL);
INSERT INTO audit_log VALUES(85,'schedule',612,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 17:37:45',NULL,NULL);
INSERT INTO audit_log VALUES(86,'schedule',613,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 17:37:45',NULL,NULL);
INSERT INTO audit_log VALUES(87,'schedule',614,'create_manual',NULL,'{"date":"2025-08-22","guide1_id":4,"type":"כונן","created_by":1}',1,'2025-07-27 17:38:10',NULL,NULL);
INSERT INTO audit_log VALUES(88,'schedule',615,'create_manual',NULL,'{"date":"2025-08-23","guide1_id":4,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 17:38:10',NULL,NULL);
INSERT INTO audit_log VALUES(89,'schedule',616,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"type":"רגיל","created_by":1}',1,'2025-07-27 17:39:05',NULL,NULL);
INSERT INTO audit_log VALUES(90,'schedule',616,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":3,"type":"רגיל","created_by":1}',1,'2025-07-27 17:39:12',NULL,NULL);
INSERT INTO audit_log VALUES(91,'schedule',616,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 17:39:32',NULL,NULL);
INSERT INTO audit_log VALUES(92,'schedule',639,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":5,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 17:39:39',NULL,NULL);
INSERT INTO audit_log VALUES(93,'schedule',688,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":4,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-27 17:54:33',NULL,NULL);
INSERT INTO audit_log VALUES(94,'schedule',689,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":5,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-27 17:54:38',NULL,NULL);
INSERT INTO audit_log VALUES(95,'schedule',690,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":12,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-27 17:54:48',NULL,NULL);
INSERT INTO audit_log VALUES(96,'schedule',691,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-27 17:54:55',NULL,NULL);
INSERT INTO audit_log VALUES(97,'schedule',692,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 17:54:55',NULL,NULL);
INSERT INTO audit_log VALUES(98,'schedule',692,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":3,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 17:55:09',NULL,NULL);
INSERT INTO audit_log VALUES(99,'schedule',693,'create_manual',NULL,'{"date":"2025-08-22","guide1_id":3,"type":"כונן","created_by":1}',1,'2025-07-27 17:55:15',NULL,NULL);
INSERT INTO audit_log VALUES(100,'schedule',694,'create_manual',NULL,'{"date":"2025-08-23","guide1_id":3,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-27 17:55:15',NULL,NULL);
INSERT INTO audit_log VALUES(101,'schedule',694,'create_manual',NULL,'{"date":"2025-08-23","guide1_id":2,"type":"מוצ״ש","created_by":1}',1,'2025-07-27 17:55:33',NULL,NULL);
INSERT INTO audit_log VALUES(102,'schedule',742,'create_manual',NULL,'{"date":"2025-08-13","guide1_id":1,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-28 07:41:57',NULL,NULL);
INSERT INTO audit_log VALUES(103,'schedule',743,'create_manual',NULL,'{"date":"2025-08-17","guide1_id":12,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-28 07:42:17',NULL,NULL);
INSERT INTO audit_log VALUES(104,'schedule',744,'create_manual',NULL,'{"date":"2025-08-27","guide1_id":2,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-28 07:42:49',NULL,NULL);
INSERT INTO audit_log VALUES(105,'schedule',745,'create_manual',NULL,'{"date":"2025-08-29","guide1_id":7,"type":"רגיל","created_by":1}',1,'2025-07-28 07:43:00',NULL,NULL);
INSERT INTO audit_log VALUES(106,'schedule',746,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":6,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-28 07:43:16',NULL,NULL);
INSERT INTO audit_log VALUES(107,'schedule',747,'create_manual',NULL,'{"date":"2025-08-07","guide1_id":5,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-28 07:43:33',NULL,NULL);
INSERT INTO audit_log VALUES(108,'schedule',748,'create_manual',NULL,'{"date":"2025-08-11","guide1_id":12,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-28 07:43:54',NULL,NULL);
INSERT INTO audit_log VALUES(109,'schedule',692,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":6,"type":"מוצ״ש","created_by":1}',1,'2025-07-28 07:44:29',NULL,NULL);
INSERT INTO audit_log VALUES(110,'schedule',827,'create_manual',NULL,'{"date":"2025-07-01","guide1_id":1,"guide2_id":12,"type":"חפיפה","created_by":1}',1,'2025-07-29 04:16:12',NULL,NULL);
INSERT INTO audit_log VALUES(111,'schedule',828,'create_manual',NULL,'{"date":"2025-07-09","guide1_id":6,"guide2_id":4,"type":"חפיפה","created_by":1}',1,'2025-07-29 04:16:19',NULL,NULL);
INSERT INTO audit_log VALUES(112,'schedule',829,'create_manual',NULL,'{"date":"2025-07-23","guide1_id":6,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-29 04:16:37',NULL,NULL);
INSERT INTO audit_log VALUES(113,'schedule',886,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":7,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-29 12:23:00',NULL,NULL);
INSERT INTO audit_log VALUES(114,'schedule',917,'create_manual',NULL,'{"date":"2025-08-01","guide1_id":3,"guide2_id":4,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:39:16',NULL,NULL);
INSERT INTO audit_log VALUES(115,'schedule',918,'create_manual',NULL,'{"date":"2025-08-02","guide1_id":2,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:39:28',NULL,NULL);
INSERT INTO audit_log VALUES(116,'schedule',919,'create_manual',NULL,'{"date":"2025-08-03","guide1_id":4,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:39:40',NULL,NULL);
INSERT INTO audit_log VALUES(117,'schedule',920,'create_manual',NULL,'{"date":"2025-08-04","guide1_id":6,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:39:55',NULL,NULL);
INSERT INTO audit_log VALUES(118,'schedule',921,'create_manual',NULL,'{"date":"2025-08-05","guide1_id":1,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:40:05',NULL,NULL);
INSERT INTO audit_log VALUES(119,'schedule',922,'create_manual',NULL,'{"date":"2025-08-06","guide1_id":6,"guide2_id":12,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:40:11',NULL,NULL);
INSERT INTO audit_log VALUES(120,'schedule',923,'create_manual',NULL,'{"date":"2025-08-07","guide1_id":5,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:40:26',NULL,NULL);
INSERT INTO audit_log VALUES(121,'schedule',924,'create_manual',NULL,'{"date":"2025-08-08","guide1_id":12,"type":"כונן","created_by":1}',1,'2025-07-29 13:40:32',NULL,NULL);
INSERT INTO audit_log VALUES(122,'schedule',925,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":12,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-29 13:40:32',NULL,NULL);
INSERT INTO audit_log VALUES(123,'schedule',925,'create_manual',NULL,'{"date":"2025-08-09","guide1_id":6,"type":"מוצ״ש","created_by":1}',1,'2025-07-29 13:40:38',NULL,NULL);
INSERT INTO audit_log VALUES(124,'schedule',926,'create_manual',NULL,'{"date":"2025-08-10","guide1_id":4,"guide2_id":1,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:40:53',NULL,NULL);
INSERT INTO audit_log VALUES(125,'schedule',927,'create_manual',NULL,'{"date":"2025-08-11","guide1_id":12,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:40:59',NULL,NULL);
INSERT INTO audit_log VALUES(126,'schedule',928,'create_manual',NULL,'{"date":"2025-08-12","guide1_id":4,"guide2_id":6,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:41:21',NULL,NULL);
INSERT INTO audit_log VALUES(127,'schedule',929,'create_manual',NULL,'{"date":"2025-08-13","guide1_id":1,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:41:33',NULL,NULL);
INSERT INTO audit_log VALUES(128,'schedule',930,'create_manual',NULL,'{"date":"2025-08-14","guide1_id":3,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:41:37',NULL,NULL);
INSERT INTO audit_log VALUES(129,'schedule',931,'create_manual',NULL,'{"date":"2025-08-15","guide1_id":12,"guide2_id":4,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:41:49',NULL,NULL);
INSERT INTO audit_log VALUES(130,'schedule',932,'create_manual',NULL,'{"date":"2025-08-16","guide1_id":6,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:41:56',NULL,NULL);
INSERT INTO audit_log VALUES(131,'schedule',933,'create_manual',NULL,'{"date":"2025-08-17","guide1_id":12,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:42:31',NULL,NULL);
INSERT INTO audit_log VALUES(132,'schedule',934,'create_manual',NULL,'{"date":"2025-08-18","guide1_id":2,"guide2_id":4,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:42:40',NULL,NULL);
INSERT INTO audit_log VALUES(133,'schedule',935,'create_manual',NULL,'{"date":"2025-08-19","guide1_id":3,"guide2_id":6,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:42:51',NULL,NULL);
INSERT INTO audit_log VALUES(134,'schedule',936,'create_manual',NULL,'{"date":"2025-08-20","guide1_id":1,"guide2_id":4,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:43:02',NULL,NULL);
INSERT INTO audit_log VALUES(135,'schedule',937,'create_manual',NULL,'{"date":"2025-08-21","guide1_id":12,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:43:09',NULL,NULL);
INSERT INTO audit_log VALUES(136,'schedule',938,'create_manual',NULL,'{"date":"2025-08-22","guide1_id":3,"type":"כונן","created_by":1}',1,'2025-07-29 13:43:19',NULL,NULL);
INSERT INTO audit_log VALUES(137,'schedule',939,'create_manual',NULL,'{"date":"2025-08-23","guide1_id":3,"guide2_id":null,"type":"כונן","created_by":1}',1,'2025-07-29 13:43:19',NULL,NULL);
INSERT INTO audit_log VALUES(138,'schedule',939,'create_manual',NULL,'{"date":"2025-08-23","guide1_id":2,"type":"מוצ״ש","created_by":1}',1,'2025-07-29 13:43:31',NULL,NULL);
INSERT INTO audit_log VALUES(139,'schedule',940,'create_manual',NULL,'{"date":"2025-08-24","guide1_id":6,"guide2_id":1,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:43:44',NULL,NULL);
INSERT INTO audit_log VALUES(140,'schedule',941,'create_manual',NULL,'{"date":"2025-08-25","guide1_id":12,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:43:50',NULL,NULL);
INSERT INTO audit_log VALUES(141,'schedule',942,'create_manual',NULL,'{"date":"2025-08-26","guide1_id":3,"guide2_id":1,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:43:59',NULL,NULL);
INSERT INTO audit_log VALUES(142,'schedule',943,'create_manual',NULL,'{"date":"2025-08-27","guide1_id":2,"guide2_id":7,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:44:04',NULL,NULL);
INSERT INTO audit_log VALUES(143,'schedule',944,'create_manual',NULL,'{"date":"2025-08-28","guide1_id":6,"guide2_id":3,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:44:17',NULL,NULL);
INSERT INTO audit_log VALUES(144,'schedule',945,'create_manual',NULL,'{"date":"2025-08-29","guide1_id":7,"guide2_id":1,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:44:23',NULL,NULL);
INSERT INTO audit_log VALUES(145,'schedule',946,'create_manual',NULL,'{"date":"2025-08-30","guide1_id":1,"guide2_id":6,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:44:39',NULL,NULL);
INSERT INTO audit_log VALUES(146,'schedule',947,'create_manual',NULL,'{"date":"2025-08-31","guide1_id":4,"guide2_id":12,"type":"חפיפה","created_by":1}',1,'2025-07-29 13:44:47',NULL,NULL);
INSERT INTO audit_log VALUES(147,'schedule',978,'create_manual',NULL,'{"date":"2025-09-01","guide1_id":6,"guide2_id":2,"type":"חפיפה","created_by":1}',1,'2025-08-05 17:48:17',NULL,NULL);
INSERT INTO audit_log VALUES(148,'schedule',1008,'create_manual',NULL,'{"date":"2025-10-06","guide1_id":7,"guide2_id":5,"type":"חפיפה","created_by":1}',1,'2025-08-05 18:01:15',NULL,NULL);
INSERT INTO audit_log VALUES(149,'schedule',1009,'create_manual',NULL,'{"date":"2025-10-07","guide1_id":1,"guide2_id":12,"type":"חפיפה","created_by":1}',1,'2025-08-05 18:01:27',NULL,NULL);
CREATE TABLE weekend_types (id INTEGER PRIMARY KEY, date TEXT UNIQUE, is_closed INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO weekend_types VALUES(1,'2025-08-08',1,'2025-07-27 07:36:36');
INSERT INTO weekend_types VALUES(2,'2025-08-22',1,'2025-07-27 07:36:38');
INSERT INTO weekend_types VALUES(219,'2025-09-05',1,'2025-08-05 17:48:43');
INSERT INTO weekend_types VALUES(220,'2025-09-19',1,'2025-08-05 17:48:44');
INSERT INTO weekend_types VALUES(221,'2025-10-03',1,'2025-08-05 18:00:55');
INSERT INTO weekend_types VALUES(222,'2025-10-17',1,'2025-08-05 18:00:57');
INSERT INTO weekend_types VALUES(223,'2025-10-31',1,'2025-08-05 18:00:59');
INSERT INTO weekend_types VALUES(336,'2025-08-09',1,'2025-08-07 03:59:42');
INSERT INTO weekend_types VALUES(337,'2025-08-23',1,'2025-08-07 03:59:42');
CREATE TABLE coordinator_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_type TEXT NOT NULL,
    guide1_id INTEGER,
    guide2_id INTEGER,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_by INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guide1_id) REFERENCES users(id),
    FOREIGN KEY (guide2_id) REFERENCES users(id)
  );
INSERT INTO coordinator_rules VALUES(1,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 11:47:54','2025-07-27 11:52:27');
INSERT INTO coordinator_rules VALUES(2,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 11:47:54','2025-07-27 11:53:50');
INSERT INTO coordinator_rules VALUES(3,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 11:47:54','2025-07-27 11:53:53');
INSERT INTO coordinator_rules VALUES(4,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 11:47:54','2025-07-27 11:53:55');
INSERT INTO coordinator_rules VALUES(5,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 11:52:39','2025-07-27 11:53:43');
INSERT INTO coordinator_rules VALUES(6,'no_conan',3,NULL,'שקד - לא לשבץ ככונן',0,1,'2025-07-27 11:57:39','2025-07-27 11:58:44');
INSERT INTO coordinator_rules VALUES(7,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 11:58:03','2025-07-27 11:58:49');
INSERT INTO coordinator_rules VALUES(8,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 11:58:14','2025-07-27 11:58:46');
INSERT INTO coordinator_rules VALUES(9,'no_auto_scheduling',7,NULL,NULL,0,1,'2025-07-27 12:00:32','2025-07-27 12:15:57');
INSERT INTO coordinator_rules VALUES(10,'no_together',5,12,NULL,0,1,'2025-07-27 12:00:49','2025-07-27 12:20:32');
INSERT INTO coordinator_rules VALUES(11,'no_conan',1,NULL,NULL,0,1,'2025-07-27 12:01:09','2025-07-27 12:18:05');
INSERT INTO coordinator_rules VALUES(12,'no_auto_scheduling',5,NULL,NULL,0,1,'2025-07-27 12:01:18','2025-07-27 12:15:55');
INSERT INTO coordinator_rules VALUES(13,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 12:03:47','2025-07-27 12:15:38');
INSERT INTO coordinator_rules VALUES(14,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 12:03:47','2025-07-27 12:17:50');
INSERT INTO coordinator_rules VALUES(15,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 12:03:47','2025-07-27 12:20:09');
INSERT INTO coordinator_rules VALUES(16,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 12:03:47','2025-07-27 12:20:18');
INSERT INTO coordinator_rules VALUES(17,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 12:03:57','2025-07-27 12:13:21');
INSERT INTO coordinator_rules VALUES(18,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 12:03:57','2025-07-27 12:17:12');
INSERT INTO coordinator_rules VALUES(19,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 12:03:57','2025-07-27 12:19:18');
INSERT INTO coordinator_rules VALUES(20,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 12:03:57','2025-07-27 12:20:02');
INSERT INTO coordinator_rules VALUES(21,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 12:04:04','2025-07-27 12:13:16');
INSERT INTO coordinator_rules VALUES(22,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 12:04:04','2025-07-27 12:17:07');
INSERT INTO coordinator_rules VALUES(23,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 12:04:04','2025-07-27 12:19:03');
INSERT INTO coordinator_rules VALUES(24,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 12:04:04','2025-07-27 12:19:08');
INSERT INTO coordinator_rules VALUES(25,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 12:04:15','2025-07-27 12:13:11');
INSERT INTO coordinator_rules VALUES(26,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 12:04:15','2025-07-27 12:17:01');
INSERT INTO coordinator_rules VALUES(27,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 12:04:15','2025-07-27 12:18:54');
INSERT INTO coordinator_rules VALUES(28,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 12:04:15','2025-07-27 12:18:58');
INSERT INTO coordinator_rules VALUES(29,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 12:04:22','2025-07-27 12:13:05');
INSERT INTO coordinator_rules VALUES(30,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 12:04:22','2025-07-27 12:16:04');
INSERT INTO coordinator_rules VALUES(31,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 12:04:22','2025-07-27 12:18:44');
INSERT INTO coordinator_rules VALUES(32,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 12:04:22','2025-07-27 12:18:49');
INSERT INTO coordinator_rules VALUES(33,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 12:04:32','2025-07-27 12:05:11');
INSERT INTO coordinator_rules VALUES(34,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 12:04:32','2025-07-27 12:16:02');
INSERT INTO coordinator_rules VALUES(35,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 12:04:32','2025-07-27 12:18:30');
INSERT INTO coordinator_rules VALUES(36,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 12:04:32','2025-07-27 12:18:36');
INSERT INTO coordinator_rules VALUES(37,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 12:14:27','2025-07-27 12:15:42');
INSERT INTO coordinator_rules VALUES(38,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 12:14:27','2025-07-27 12:16:00');
INSERT INTO coordinator_rules VALUES(39,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 12:14:27','2025-07-27 12:17:18');
INSERT INTO coordinator_rules VALUES(40,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 12:14:27','2025-07-27 12:18:24');
INSERT INTO coordinator_rules VALUES(41,'no_auto_scheduling',7,NULL,'משובץ ידנית',1,1,'2025-07-27 12:21:21','2025-07-27 12:21:21');
INSERT INTO coordinator_rules VALUES(42,'no_auto_scheduling',5,NULL,'בגלל החופשה הארוכה',1,1,'2025-07-27 12:21:36','2025-07-27 12:21:36');
INSERT INTO coordinator_rules VALUES(43,'no_conan',1,NULL,NULL,1,1,'2025-07-27 12:21:46','2025-07-27 12:21:46');
INSERT INTO coordinator_rules VALUES(44,'no_together',12,5,NULL,1,1,'2025-07-27 12:22:00','2025-07-27 12:22:00');
INSERT INTO coordinator_rules VALUES(45,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 16:24:26','2025-07-27 17:08:15');
INSERT INTO coordinator_rules VALUES(46,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 16:24:26','2025-07-27 17:08:24');
INSERT INTO coordinator_rules VALUES(47,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 16:24:26','2025-07-27 17:08:30');
INSERT INTO coordinator_rules VALUES(48,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 16:24:26','2025-07-27 17:10:17');
INSERT INTO coordinator_rules VALUES(49,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 16:24:43','2025-07-27 17:08:15');
INSERT INTO coordinator_rules VALUES(50,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 16:24:43','2025-07-27 17:08:24');
INSERT INTO coordinator_rules VALUES(51,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 16:24:43','2025-07-27 17:08:30');
INSERT INTO coordinator_rules VALUES(52,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 16:24:43','2025-07-27 17:10:17');
INSERT INTO coordinator_rules VALUES(53,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 16:40:52','2025-07-27 17:08:15');
INSERT INTO coordinator_rules VALUES(54,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 16:40:52','2025-07-27 17:08:24');
INSERT INTO coordinator_rules VALUES(55,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 16:40:52','2025-07-27 17:08:30');
INSERT INTO coordinator_rules VALUES(56,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 16:40:52','2025-07-27 17:10:17');
INSERT INTO coordinator_rules VALUES(57,'no_auto_scheduling',1,NULL,'אלדד - לא לשבץ באוטומטי',0,1,'2025-07-27 16:46:10','2025-07-27 17:08:15');
INSERT INTO coordinator_rules VALUES(58,'no_conan',2,NULL,'תום - לא לשבץ ככונן',0,1,'2025-07-27 16:46:10','2025-07-27 17:08:24');
INSERT INTO coordinator_rules VALUES(59,'no_together',1,6,'אלדד ויפתח - לא לעבוד יחד',0,1,'2025-07-27 16:46:10','2025-07-27 17:08:30');
INSERT INTO coordinator_rules VALUES(60,'no_together',4,7,'עופרי ורפאל - לא לעבוד יחד',0,1,'2025-07-27 16:46:10','2025-07-27 17:10:17');
CREATE TABLE official_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    schedule_data TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
INSERT INTO official_schedules VALUES(2,'2025-07',1,'[{"id":827,"date":"2025-07-01","weekday":"שלישי","type":"חפיפה","guide1_id":1,"guide2_id":12,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 04:16:12","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"ליאור","guide2_role":null},{"id":858,"date":"2025-07-02","weekday":"רביעי","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":859,"date":"2025-07-03","weekday":"חמישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":860,"date":"2025-07-04","weekday":"שישי","type":"רגיל","guide1_id":1,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":861,"date":"2025-07-05","weekday":"שבת","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":862,"date":"2025-07-06","weekday":"ראשון","type":"רגיל","guide1_id":12,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":863,"date":"2025-07-07","weekday":"שני","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":864,"date":"2025-07-08","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":828,"date":"2025-07-09","weekday":"רביעי","type":"חפיפה","guide1_id":6,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 04:16:19","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":865,"date":"2025-07-10","weekday":"חמישי","type":"רגיל","guide1_id":12,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":866,"date":"2025-07-11","weekday":"שישי","type":"רגיל","guide1_id":2,"guide2_id":3,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"שקד","guide2_role":"חפיפה"},{"id":867,"date":"2025-07-12","weekday":"שבת","type":"רגיל","guide1_id":6,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":868,"date":"2025-07-13","weekday":"ראשון","type":"רגיל","guide1_id":1,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":869,"date":"2025-07-14","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":870,"date":"2025-07-15","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":871,"date":"2025-07-16","weekday":"רביעי","type":"רגיל","guide1_id":12,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":872,"date":"2025-07-17","weekday":"חמישי","type":"רגיל","guide1_id":3,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":873,"date":"2025-07-18","weekday":"שישי","type":"רגיל","guide1_id":6,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":874,"date":"2025-07-19","weekday":"שבת","type":"רגיל","guide1_id":12,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":875,"date":"2025-07-20","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":876,"date":"2025-07-21","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":877,"date":"2025-07-22","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":829,"date":"2025-07-23","weekday":"רביעי","type":"חפיפה","guide1_id":6,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 04:16:37","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":878,"date":"2025-07-24","weekday":"חמישי","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":879,"date":"2025-07-25","weekday":"שישי","type":"רגיל","guide1_id":2,"guide2_id":3,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"שקד","guide2_role":"חפיפה"},{"id":880,"date":"2025-07-26","weekday":"שבת","type":"רגיל","guide1_id":12,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":881,"date":"2025-07-27","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":882,"date":"2025-07-28","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":883,"date":"2025-07-29","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":884,"date":"2025-07-30","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":885,"date":"2025-07-31","weekday":"חמישי","type":"רגיל","guide1_id":4,"guide2_id":3,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"שקד","guide2_role":"חפיפה"}]',1,'2025-07-29 04:17:44','active','');
INSERT INTO official_schedules VALUES(3,'2025-08',1,'[{"id":917,"date":"2025-08-01","weekday":"שישי","type":"חפיפה","guide1_id":3,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:16","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":918,"date":"2025-08-02","weekday":"שבת","type":"חפיפה","guide1_id":2,"guide2_id":5,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:28","updated_at":null,"guide1_name":"תום","guide1_role":null,"guide2_name":"עמית","guide2_role":null},{"id":919,"date":"2025-08-03","weekday":"ראשון","type":"חפיפה","guide1_id":4,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:40","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":920,"date":"2025-08-04","weekday":"שני","type":"חפיפה","guide1_id":6,"guide2_id":5,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:39:55","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"עמית","guide2_role":null},{"id":921,"date":"2025-08-05","weekday":"שלישי","type":"חפיפה","guide1_id":1,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:05","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":922,"date":"2025-08-06","weekday":"רביעי","type":"חפיפה","guide1_id":6,"guide2_id":12,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:11","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"ליאור","guide2_role":null},{"id":923,"date":"2025-08-07","weekday":"חמישי","type":"חפיפה","guide1_id":5,"guide2_id":3,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:26","updated_at":null,"guide1_name":"עמית","guide1_role":null,"guide2_name":"שקד","guide2_role":null},{"id":924,"date":"2025-08-08","weekday":"שישי","type":"כונן","guide1_id":12,"guide2_id":null,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:32","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":null,"guide2_role":null},{"id":925,"date":"2025-08-09","weekday":"שבת","type":"מוצ״ש","guide1_id":12,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:32","updated_at":"2025-07-29 13:40:38","guide1_name":"ליאור","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":926,"date":"2025-08-10","weekday":"ראשון","type":"חפיפה","guide1_id":4,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:53","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":927,"date":"2025-08-11","weekday":"שני","type":"חפיפה","guide1_id":12,"guide2_id":5,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:40:59","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"עמית","guide2_role":null},{"id":928,"date":"2025-08-12","weekday":"שלישי","type":"חפיפה","guide1_id":4,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:21","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":929,"date":"2025-08-13","weekday":"רביעי","type":"חפיפה","guide1_id":1,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:33","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":930,"date":"2025-08-14","weekday":"חמישי","type":"חפיפה","guide1_id":3,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:37","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":931,"date":"2025-08-15","weekday":"שישי","type":"חפיפה","guide1_id":12,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:49","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":932,"date":"2025-08-16","weekday":"שבת","type":"חפיפה","guide1_id":6,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:41:56","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":933,"date":"2025-08-17","weekday":"ראשון","type":"חפיפה","guide1_id":12,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:42:31","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":934,"date":"2025-08-18","weekday":"שני","type":"חפיפה","guide1_id":2,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:42:40","updated_at":null,"guide1_name":"תום","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":935,"date":"2025-08-19","weekday":"שלישי","type":"חפיפה","guide1_id":3,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:42:51","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":936,"date":"2025-08-20","weekday":"רביעי","type":"חפיפה","guide1_id":1,"guide2_id":4,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:02","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"עופרי","guide2_role":null},{"id":937,"date":"2025-08-21","weekday":"חמישי","type":"חפיפה","guide1_id":12,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:09","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":938,"date":"2025-08-22","weekday":"שישי","type":"כונן","guide1_id":3,"guide2_id":null,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:19","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":null,"guide2_role":null},{"id":939,"date":"2025-08-23","weekday":"שבת","type":"מוצ״ש","guide1_id":3,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:19","updated_at":"2025-07-29 13:43:31","guide1_name":"שקד","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":940,"date":"2025-08-24","weekday":"ראשון","type":"חפיפה","guide1_id":6,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:44","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":941,"date":"2025-08-25","weekday":"שני","type":"חפיפה","guide1_id":12,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:50","updated_at":null,"guide1_name":"ליאור","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":942,"date":"2025-08-26","weekday":"שלישי","type":"חפיפה","guide1_id":3,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:43:59","updated_at":null,"guide1_name":"שקד","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":943,"date":"2025-08-27","weekday":"רביעי","type":"חפיפה","guide1_id":2,"guide2_id":7,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:04","updated_at":null,"guide1_name":"תום","guide1_role":null,"guide2_name":"רפאל","guide2_role":null},{"id":944,"date":"2025-08-28","weekday":"חמישי","type":"חפיפה","guide1_id":6,"guide2_id":3,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:17","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"שקד","guide2_role":null},{"id":945,"date":"2025-08-29","weekday":"שישי","type":"חפיפה","guide1_id":7,"guide2_id":1,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:23","updated_at":null,"guide1_name":"רפאל","guide1_role":null,"guide2_name":"אלדד","guide2_role":null},{"id":946,"date":"2025-08-30","weekday":"שבת","type":"חפיפה","guide1_id":1,"guide2_id":6,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:39","updated_at":null,"guide1_name":"אלדד","guide1_role":null,"guide2_name":"יפתח","guide2_role":null},{"id":947,"date":"2025-08-31","weekday":"ראשון","type":"חפיפה","guide1_id":4,"guide2_id":12,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-07-29 13:44:47","updated_at":null,"guide1_name":"עופרי","guide1_role":null,"guide2_name":"ליאור","guide2_role":null}]',1,'2025-07-29 13:45:04','active','');
INSERT INTO official_schedules VALUES(4,'2025-09',1,'[{"id":978,"date":"2025-09-01","weekday":"שני","type":"חפיפה","guide1_id":6,"guide2_id":2,"is_manual":1,"is_locked":1,"created_by":1,"created_at":"2025-08-05 17:48:17","updated_at":null,"guide1_name":"יפתח","guide1_role":null,"guide2_name":"תום","guide2_role":null},{"id":979,"date":"2025-09-02","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":980,"date":"2025-09-03","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":981,"date":"2025-09-04","weekday":"חמישי","type":"רגיל","guide1_id":12,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":982,"date":"2025-09-05","weekday":"שישי","type":"רגיל","guide1_id":3,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"כונן","guide2_name":null,"guide2_role":null},{"id":983,"date":"2025-09-06","weekday":"שבת","type":"רגיל","guide1_id":1,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"מוצ״ש","guide2_name":null,"guide2_role":null},{"id":984,"date":"2025-09-07","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":985,"date":"2025-09-08","weekday":"שני","type":"רגיל","guide1_id":12,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":986,"date":"2025-09-09","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":987,"date":"2025-09-10","weekday":"רביעי","type":"רגיל","guide1_id":4,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":988,"date":"2025-09-11","weekday":"חמישי","type":"רגיל","guide1_id":12,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":989,"date":"2025-09-12","weekday":"שישי","type":"רגיל","guide1_id":1,"guide2_id":3,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"שקד","guide2_role":"חפיפה"},{"id":990,"date":"2025-09-13","weekday":"שבת","type":"רגיל","guide1_id":4,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":991,"date":"2025-09-14","weekday":"ראשון","type":"רגיל","guide1_id":6,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":992,"date":"2025-09-15","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":993,"date":"2025-09-16","weekday":"שלישי","type":"רגיל","guide1_id":3,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":994,"date":"2025-09-17","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":995,"date":"2025-09-18","weekday":"חמישי","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":996,"date":"2025-09-19","weekday":"שישי","type":"רגיל","guide1_id":3,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"שקד","guide1_role":"כונן","guide2_name":null,"guide2_role":null},{"id":997,"date":"2025-09-20","weekday":"שבת","type":"רגיל","guide1_id":12,"guide2_id":null,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"מוצ״ש","guide2_name":null,"guide2_role":null},{"id":998,"date":"2025-09-21","weekday":"ראשון","type":"רגיל","guide1_id":1,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":999,"date":"2025-09-22","weekday":"שני","type":"רגיל","guide1_id":2,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"},{"id":1000,"date":"2025-09-23","weekday":"שלישי","type":"רגיל","guide1_id":12,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":1001,"date":"2025-09-24","weekday":"רביעי","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":1002,"date":"2025-09-25","weekday":"חמישי","type":"רגיל","guide1_id":4,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":1003,"date":"2025-09-26","weekday":"שישי","type":"רגיל","guide1_id":1,"guide2_id":6,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"אלדד","guide1_role":"רגיל","guide2_name":"יפתח","guide2_role":"חפיפה"},{"id":1004,"date":"2025-09-27","weekday":"שבת","type":"רגיל","guide1_id":2,"guide2_id":12,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"תום","guide1_role":"רגיל","guide2_name":"ליאור","guide2_role":"חפיפה"},{"id":1005,"date":"2025-09-28","weekday":"ראשון","type":"רגיל","guide1_id":4,"guide2_id":1,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"עופרי","guide1_role":"רגיל","guide2_name":"אלדד","guide2_role":"חפיפה"},{"id":1006,"date":"2025-09-29","weekday":"שני","type":"רגיל","guide1_id":6,"guide2_id":2,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"יפתח","guide1_role":"רגיל","guide2_name":"תום","guide2_role":"חפיפה"},{"id":1007,"date":"2025-09-30","weekday":"שלישי","type":"רגיל","guide1_id":12,"guide2_id":4,"is_manual":0,"is_locked":0,"created_by":null,"created_at":null,"updated_at":null,"guide1_name":"ליאור","guide1_role":"רגיל","guide2_name":"עופרי","guide2_role":"חפיפה"}]',1,'2025-08-05 17:50:53','active','');
CREATE TABLE schedule_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    schedule_type TEXT NOT NULL, -- 'draft', 'official'
    version INTEGER NOT NULL,
    schedule_data TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    action TEXT, -- 'created', 'modified', 'sent_to_guides', 'finalized'
    notes TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
CREATE TABLE email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    draft_version INTEGER NOT NULL,
    recipient_id INTEGER,
    recipient_email TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    email_content TEXT,
    FOREIGN KEY (recipient_id) REFERENCES users(id)
  );
INSERT INTO email_logs VALUES(1,'2025-08',3,1,'eldad@dror.co.il','2025-07-29 03:55:45','sent','Email for אלדד: 9 shifts in 2025-08');
INSERT INTO email_logs VALUES(2,'2025-08',3,2,'תום@example.com','2025-07-29 03:55:45','sent','Email for תום: 8 shifts in 2025-08');
INSERT INTO email_logs VALUES(3,'2025-08',3,3,'שקד@example.com','2025-07-29 03:55:45','sent','Email for שקד: 8 shifts in 2025-08');
INSERT INTO email_logs VALUES(4,'2025-08',3,4,'עופרי@example.com','2025-07-29 03:55:45','sent','Email for עופרי: 8 shifts in 2025-08');
INSERT INTO email_logs VALUES(5,'2025-08',3,5,'amit@dror.com','2025-07-29 03:55:45','sent','Email for עמית: 4 shifts in 2025-08');
INSERT INTO email_logs VALUES(6,'2025-08',3,6,'יפתח@example.com','2025-07-29 03:55:45','sent','Email for יפתח: 8 shifts in 2025-08');
INSERT INTO email_logs VALUES(7,'2025-08',3,7,'רפאל@example.com','2025-07-29 03:55:45','sent','Email for רפאל: 5 shifts in 2025-08');
INSERT INTO email_logs VALUES(8,'2025-08',3,12,'lior@dror.co.il','2025-07-29 03:55:45','sent','Email for ליאור: 9 shifts in 2025-08');
CREATE TABLE workflow_status (
    month TEXT PRIMARY KEY,
    current_draft_version INTEGER DEFAULT 0,
    is_finalized INTEGER DEFAULT 0,
    finalized_at DATETIME,
    finalized_by INTEGER,
    last_email_sent_version INTEGER DEFAULT 0,
    last_email_sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (finalized_by) REFERENCES users(id)
  );
INSERT INTO workflow_status VALUES('2025-07',2,1,'2025-07-29 04:17:44',1,0,NULL,'2025-07-29 04:16:50','2025-07-29 04:17:44');
INSERT INTO workflow_status VALUES('2025-08',1,1,'2025-07-29 13:45:04',1,0,NULL,'2025-07-29 13:44:58','2025-07-29 13:45:04');
INSERT INTO workflow_status VALUES('2025-09',1,1,'2025-08-05 17:50:53',1,0,NULL,'2025-08-05 17:50:13','2025-08-05 17:50:53');
CREATE TABLE houses (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100) NOT NULL, display_name VARCHAR(100) NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO houses VALUES('dror','dror','דרור',1,'2025-08-06 06:35:26');
INSERT INTO houses VALUES('havatzelet','havatzelet','חבצלת',1,'2025-08-06 06:35:26');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',12);
INSERT INTO sqlite_sequence VALUES('constraints',99);
INSERT INTO sqlite_sequence VALUES('fixed_constraints',13);
INSERT INTO sqlite_sequence VALUES('vacations',2);
INSERT INTO sqlite_sequence VALUES('schedule_draft',500);
INSERT INTO sqlite_sequence VALUES('schedule',1038);
INSERT INTO sqlite_sequence VALUES('scheduling_rules',8);
INSERT INTO sqlite_sequence VALUES('assignment_types',4);
INSERT INTO sqlite_sequence VALUES('shift_types',4);
INSERT INTO sqlite_sequence VALUES('audit_log',149);
INSERT INTO sqlite_sequence VALUES('coordinator_rules',60);
INSERT INTO sqlite_sequence VALUES('drafts',7);
INSERT INTO sqlite_sequence VALUES('email_logs',8);
INSERT INTO sqlite_sequence VALUES('official_schedules',4);
CREATE INDEX idx_coordinator_rules_type 
  ON coordinator_rules(rule_type, is_active)
;
CREATE INDEX idx_coordinator_rules_guides 
  ON coordinator_rules(guide1_id, guide2_id, is_active)
;
CREATE INDEX idx_schedule_date 
  ON schedule(date)
;
CREATE INDEX idx_schedule_guides 
  ON schedule(guide1_id, guide2_id)
;
CREATE INDEX idx_schedule_manual 
  ON schedule(is_manual, is_locked)
;
CREATE INDEX idx_constraints_user_date 
  ON constraints(user_id, date)
;
CREATE INDEX idx_fixed_constraints_user_weekday 
  ON fixed_constraints(user_id, weekday)
;
CREATE INDEX idx_vacations_user_dates 
  ON vacations(user_id, date_start, date_end)
;
COMMIT;
