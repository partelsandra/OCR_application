<?php

$servername = "localhost"; 
$username = "ocradmin"; 
$password = "qwerty"; 
$dbname = "ocr_image_data"; 

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully";

