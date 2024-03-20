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

echo "Connected successfully\n";

// Handling data sent from Python script
$data_str = $_SERVER['argv'][1]; // Get the data from command line arguments
$data_pairs = explode(' ', $data_str); // Split data into key-value pairs

$data = [];
foreach ($data_pairs as $pair) {
    list($key, $value) = explode('=', $pair);
    // Map the keys to the appropriate column names
    switch ($key) {
        case 'filename':
            $data['Filename'] = $value;
            break;
        case 'processing_date':
            $data['Processing_Date'] = $value;
            break;
        case 'tesseract_version':
            $data['Tesseract_Version'] = $value;
            break;
        case 'enhancement_settings':
            $data['Enhancement_Settings'] = $value;
            break;
        case 'page_segmentation':
            $data['Page_Segmentation'] = $value;
            break;
        case 'image_file_path':
            $data['Image_File_Path'] = $value;
            break;
    }
}

// Insert data into the database table
$sql = "INSERT INTO ocr_data (Filename, Processing_Date, Tesseract_Version, Enhancement_Settings, Page_Segmentation, Image_File_Path) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssiis", $data['Filename'], $data['Processing_Date'], $data['Tesseract_Version'], $data['Enhancement_Settings'], $data['Page_Segmentation'], $data['Image_File_Path']);

if ($stmt->execute()) {
    echo "Data inserted successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$stmt->close();
$conn->close();


