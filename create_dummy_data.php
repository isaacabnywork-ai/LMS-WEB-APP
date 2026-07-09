<?php
define('CLI_SCRIPT', true);
require(__DIR__ . '/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/lib/grade/constants.php');
require_once($CFG->dirroot . '/lib/grade/grade_item.php');
require_once($CFG->dirroot . '/lib/grade/grade_grade.php');
require_once($CFG->dirroot . '/lib/enrollib.php');

global $DB, $USER;

// Create dummy course
$course = new stdClass();
$course->fullname = 'Advanced React Patterns';
$course->shortname = 'NEXT103';
$course->category = 1;
$course->startdate = time();
$course->visible = 1;
$course->format = 'topics';
$course = create_course($course);
echo "Created course: " . $course->id . "\n";

// Enrol admin user (id=2) into the course
$enrol = enrol_get_plugin('manual');
$instances = enrol_get_instances($course->id, true);
$manualinstance = null;
foreach ($instances as $instance) {
    if ($instance->enrol === 'manual') {
        $manualinstance = $instance;
        break;
    }
}
$user = $DB->get_record('user', array('id' => 2));
$studentrole = $DB->get_record('role', array('shortname' => 'student'));
$enrol->enrol_user($manualinstance, $user->id, $studentrole->id);
echo "Enrolled admin as student.\n";

// Create a dummy assignment grade item
$params = array(
    'itemname' => 'Final Capstone Project',
    'idnumber' => 'capstone3',
    'itemtype' => 'manual',
    'courseid' => $course->id,
    'gradetype' => 1, // GRADE_TYPE_VALUE
    'grademax' => 100,
    'grademin' => 0
);
$grade_item = new grade_item($params);
$grade_item->insert();
echo "Created grade item: " . $grade_item->id . "\n";

// Add a grade for the admin user
$grade_grade = new grade_grade();
$grade_grade->itemid = $grade_item->id;
$grade_grade->userid = $user->id;
$grade_grade->rawgrade = 94.5;
$grade_grade->finalgrade = 94.5;
$grade_grade->rawgrademax = 100;
$grade_grade->rawgrademin = 0;
$grade_grade->timecreated = time();
$grade_grade->timemodified = time();
$grade_grade->insert();

echo "Added grade 94.5 to admin user.\n";
