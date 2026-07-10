const fetch = require('node-fetch');

async function run() {
  const wsToken = '9acfbd1b59ae46e3f913a6fbd667ac5dcbd';
  const url = `https://academy.aviatech.aero/webservice/rest/server.php?wstoken=${wsToken}&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=11`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (data && data.length > 0) {
    const section = data.find(s => s.modules && s.modules.length > 0);
    if (section) {
      console.log("Module URL:", section.modules[0].url);
    } else {
      console.log("No modules found");
    }
  } else {
    console.log(data);
  }
}
run();
