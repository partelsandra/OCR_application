<?php

$servername = "localhost";
$username = "partelsandra_ocradmin";
$password = "qwerty12345qwerty";
$dbname = "partelsandra_OCR";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
echo "Connected successfully";