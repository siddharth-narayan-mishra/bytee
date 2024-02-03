SELECT * FROM maindatabase;

SELECT * FROM userdatabase;

ALTER TABLE maindatabase
MODIFY COLUMN password_ VARCHAR(50);

INSERT INTO userdatabase (email, first_name, last_name)
SELECT email_id, first_name, last_name FROM Maindatabase;


-----------------------------

