<?php
define('CLI_SCRIPT', true);
require('config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');

$courseid = 5; // Advanced Aviation Security
global $DB;

$course = $DB->get_record('course', ['id' => $courseid], '*', MUST_EXIST);

// Get section 1 (if it doesn't exist, course_create_sections will make it)
course_create_sections_if_missing($course, 1);
$section = $DB->get_record('course_sections', ['course' => $courseid, 'section' => 1]);

// 1. Add a Text Page (mod_page)
$page = new stdClass();
$page->course = $course->id;
$page->name = 'Introduction to Aviation Security';
$page->intro = 'Welcome to the course.';
$page->introformat = FORMAT_HTML;
$page->content = '<p>This is a text lesson. In this lesson, we will cover the basics of aviation security, threat assessment, and modern screening technologies.</p><p>Please read through the syllabus before proceeding.</p>';
$page->contentformat = FORMAT_HTML;
$page->display = 0; // standard display
$page->displayoptions = '';
$page->revision = 1;
$page->section = 1;

$module = create_moduleinfo($page, 'page', $course, $section);

// 2. Add a Video (mod_url)
$url = new stdClass();
$url->course = $course->id;
$url->name = 'Airport Security Screening Process (Video)';
$url->intro = 'Watch this video to understand the screening process.';
$url->introformat = FORMAT_HTML;
$url->externalurl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // dummy video
$url->display = 0; // auto
$url->displayoptions = '';
$url->parameters = serialize([]);
$url->section = 1;

$module2 = create_moduleinfo($url, 'url', $course, $section);

// 3. Add a Resource (mod_resource) - usually a file, but we will mock a simple text file
// Since creating files in Moodle via CLI requires File Storage API, we will just create a Label (mod_label) for now as the 3rd item
$label = new stdClass();
$label->course = $course->id;
$label->name = 'Important Notice';
$label->intro = '<h4>Important Notice</h4><p>Make sure to complete the quiz at the end of the week.</p>';
$label->introformat = FORMAT_HTML;
$label->section = 1;

$module3 = create_moduleinfo($label, 'label', $course, $section);

echo "Dummy content added to Course {$courseid}\n";

function create_moduleinfo($data, $modulename, $course, $section) {
    global $DB;
    $data->modulename = $modulename;
    $data->coursemodule = 0;
    $data->section = $section->section;
    $data->visible = 1;
    $data->visibleoncoursepage = 1;
    $data->cmidnumber = '';
    $data->groupmode = 0;
    $data->groupingid = 0;
    
    // add module instance
    $module = $DB->get_record('modules', ['name' => $modulename]);
    $data->module = $module->id;
    global $DB, $CFG;
    $addinstancefunction    = $modulename."_add_instance";
    require_once($CFG->dirroot . "/mod/$modulename/lib.php");
    $data->instance = $addinstancefunction($data, null);
    
    // add course_module
    $cw = new stdClass();
    $cw->course = $course->id;
    $cw->module = $module->id;
    $cw->instance = $data->instance;
    $cw->section = $section->id;
    $cw->added = time();
    $cw->score = 0;
    $cw->indent = 0;
    $cw->visible = $data->visible;
    $cw->visibleoncoursepage = $data->visibleoncoursepage;
    $cw->visibleold = $data->visible;
    $cw->groupmode = $data->groupmode;
    $cw->groupingid = $data->groupingid;
    
    $cw->id = $DB->insert_record('course_modules', $cw);
    
    // update section
    $section->sequence = empty($section->sequence) ? $cw->id : $section->sequence . ',' . $cw->id;
    $DB->update_record('course_sections', $section);
    
    // rebuild course cache
    rebuild_course_cache($course->id, true);
    return $cw;
}
