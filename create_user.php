<?php
define('CLI_SCRIPT', true);
require(__DIR__ . '/config.php');
require_once($CFG->dirroot . '/user/lib.php');

$username = 'student@edunova.com';
$password = 'Password123!';
$email = 'student@edunova.com';

global $DB;

$existing = $DB->get_record('user', array('username' => $username));
if ($existing) {
    echo "User already exists with ID: " . $existing->id . "\n";
    exit(0);
}

$user = new stdClass();
$user->username = $username;
$user->password = hash_internal_user_password($password);
$user->email = $email;
$user->firstname = 'Demo';
$user->lastname = 'Student';
$user->confirmed = 1;
$user->mnethostid = $CFG->mnet_localhost_id;

$userid = user_create_user($user, false, false);
echo "Created student user with ID: " . $userid . "\n";
