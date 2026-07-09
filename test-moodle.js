const MOODLE_URL = 'http://localhost:8080/webservice/rest/server.php';
const TOKEN = '28c00543f331e778b150656d98ce8cbd'; // from .env

async function run() {
  const enrolParams = new URLSearchParams();
  enrolParams.append('wstoken', TOKEN);
  enrolParams.append('wsfunction', 'enrol_manual_enrol_users');
  enrolParams.append('moodlewsrestformat', 'json');
  enrolParams.append('enrolments[0][roleid]', '5');
  enrolParams.append('enrolments[0][userid]', '3');
  enrolParams.append('enrolments[0][courseid]', '5'); // Try course 5

  const res = await fetch(`${MOODLE_URL}?${enrolParams.toString()}`, { method: 'POST' });
  const data = await res.text();
  console.log("Enrol Result:", data);
}
run();
