<?php
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
require_once($CFG->dirroot . '/user/lib.php');

global $DB;

$users = [
    ['username' => 'teacher@edunova.com', 'email' => 'teacher@edunova.com', 'firstname' => 'Teacher', 'lastname' => 'User'],
    ['username' => 'student@edunova.com', 'email' => 'student@edunova.com', 'firstname' => 'Student', 'lastname' => 'User']
];

foreach ($users as $u) {
    if ($existing = $DB->get_record('user', ['username' => $u['username']])) {
        echo "User {$u['username']} already exists with ID {$existing->id}\n";
    } else {
        $user = new stdClass();
        $user->auth = 'manual';
        $user->username = $u['username'];
        $user->password = hash_internal_user_password('password123');
        $user->firstname = $u['firstname'];
        $user->lastname = $u['lastname'];
        $user->email = $u['email'];
        $user->confirmed = 1;
        $user->mnethostid = $CFG->mnet_localhost_id;
        $user->lang = $CFG->lang;
        
        $id = user_create_user($user);
        echo "Created user {$u['username']} with ID {$id}\n";
    }
}
