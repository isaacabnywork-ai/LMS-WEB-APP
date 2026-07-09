<?php
define('CLI_SCRIPT', true);
require(__DIR__ . '/config.php');
require_once($CFG->dirroot . '/webservice/lib.php');

$serviceid = 1; // Assuming moodle_mobile_app or similar custom service
$functionname = 'enrol_manual_enrol_users';

global $DB;

$service = $DB->get_record('external_services', array('id' => $serviceid));
if (!$service) {
    echo "Service with ID $serviceid not found.\n";
    exit(1);
}

$func = $DB->get_record('external_functions', array('name' => $functionname));
if (!$func) {
    echo "Function $functionname not found in Moodle.\n";
    exit(1);
}

$exists = $DB->get_record('external_services_functions', array('externalserviceid' => $serviceid, 'functionname' => $functionname));
if ($exists) {
    echo "Function $functionname already exists in service $serviceid.\n";
} else {
    $wsman = new webservice();
    $wsman->add_external_function_to_service($functionname, $serviceid);
    echo "Successfully added $functionname to service $serviceid.\n";
}
