const http = require('http');

http.get('http://localhost:8080/webservice/rest/server.php?wstoken=28c00543f331e778b150656d98ce8cbd&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=7', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      json.forEach(section => {
        console.log(`\nSection: ${section.name}`);
        section.modules.forEach(mod => {
           console.log(` - [${mod.modname}] ${mod.name} (uservisible: ${mod.uservisible})`);
        });
      });
    } catch (e) {
      console.log("Error parsing:", data);
    }
  });
});
