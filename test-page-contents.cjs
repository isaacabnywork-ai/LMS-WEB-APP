const http = require('http');

http.get('http://localhost:8080/webservice/rest/server.php?wstoken=28c00543f331e778b150656d98ce8cbd&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=7', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const mod1 = json.find(s => s.name.includes("Module 1"));
      const readSinglish = mod1.modules.find(m => m.name.includes("Read: What is Singlish?"));
      console.log(JSON.stringify(readSinglish, null, 2));
    } catch (e) {
      console.log("Error parsing:", data);
    }
  });
});
