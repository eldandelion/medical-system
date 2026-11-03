import { execSync } from 'child_process';

const START_ID = 2001;
const COUNT = 500;
const HASH = '$2a$10$nwsUpixNAgipP8o8aI2AOe4Q1G3jJYo5PwDLe7Y14XfvSX5QlIi3u'; // password: '123456'

console.log(`Generating SQL for ${COUNT} test students (IDs ${START_ID} - ${START_ID + COUNT - 1})...`);

const userRows = [];
const studentRows = [];

for (let i = 0; i < COUNT; i++) {
  const id = START_ID + i;
  const sNum = `TEST_S${id}`;
  const name = `压测学生${id}`;
  const email = `test_s${id}@univ.edu.cn`;
  const phone = `199${String(id).padStart(8, '0')}`;
  const idCard = `11010120050101${String(id).padStart(4, '0')}`;

  userRows.push(`(${id}, '${email}', '${name}', 6, 2, '${HASH}', '${phone}')`);
  studentRows.push(
    `(${id}, '${phone}', '2005-01-01', '${email}', '测试家长', '13900000000', 1, '测试校区', '${idCard}', '2025-09-01', '${name}', '${sNum}', 1, 1, 1, 1, 2)`
  );
}

const sql = `
DELETE FROM assessment_assignments WHERE student_id >= ${START_ID} AND student_id < ${START_ID + COUNT};
DELETE FROM scale_drafts WHERE student_id >= ${START_ID} AND student_id < ${START_ID + COUNT};
DELETE FROM students WHERE user_id >= ${START_ID} AND user_id < ${START_ID + COUNT};
DELETE FROM users WHERE id >= ${START_ID} AND id < ${START_ID + COUNT};

INSERT INTO users (id, email, name, role, status, password_hash, phone) VALUES 
${userRows.join(',\n')};

INSERT INTO students (user_id, contact_number, date_of_birth, email, emergency_contact_name, emergency_contact_phone, gender, home_address, id_card_number, enrollment_date, name, student_number, assigned_teacher_id, degree_level_id, ethnicity_id, school_id, major_id) VALUES
${studentRows.join(',\n')};
`;

console.log('Executing SQL in MySQL container...');
try {
  execSync(`docker exec -i medical-system-db mysql -uroot -prootpassword medical_db`, {
    input: sql,
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  console.log(`Successfully seeded ${COUNT} students into MySQL!`);
} catch (err) {
  console.error('Failed to seed MySQL:', err.message);
  process.exit(1);
}
