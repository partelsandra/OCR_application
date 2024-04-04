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
$data_str = $_SERVER['argv'][1]; 
$data_pairs = explode(' ', $data_str);

$data = [];
foreach ($data_pairs as $pair) {
    list($key, $value) = explode('=', $pair);
    // Map the keys to the appropriate column names
    switch ($key) {
        case 'filename':
            $data['Filename'] = $value;
            break;
        case 'duration_time':
            $data['Duration_Time'] = $value;
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
        case 'image_url': // Adjusted to handle the relative path provided by Python
            $data['Image_File_Path'] = $value;
            break;
        case 'image_size':
            $data['Image_Size'] = $value;
            break;
        case 'file_size':
            $data['File_Size'] = $value;
            break;
        case 'file_format':
            $data['File_Format'] = $value;
            break;
    }
}

// Insert data into the appropriate database table based on the available data
if (isset($data['Image_Size']) && isset($data['File_Size']) && isset($data['File_Format'])) {
    // Insert into ocr_data table
    $sql = "INSERT INTO ocr_data (Filename, Processing_Date, Image_File_Path, Image_Size, File_Size, File_Format) VALUES (?, NOW(), ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $data['Filename'], $data['Image_File_Path'], $data['Image_Size'], $data['File_Size'], $data['File_Format']);  // Updated to use 'image_url'

    if ($stmt->execute()) {
        echo "Data inserted into ocr_data successfully\n";

        // Fetch the Image_ID of the inserted row
        $image_id = $stmt->insert_id;

        // Insert into processing_data table using the fetched Image_ID
        $sql_processing = "INSERT INTO processing_data (Image_ID, Duration_Time, Tesseract_Version, Enhancement_Settings, Page_Segmentation) VALUES (?, ?, ?, ?, ?)";
        $stmt_processing = $conn->prepare($sql_processing);
        $stmt_processing->bind_param("iisss", $image_id, $data['Duration_Time'], $data['Tesseract_Version'], $data['Enhancement_Settings'], $data['Page_Segmentation']);

        if ($stmt_processing->execute()) {
            echo "Data inserted into processing_data successfully\n";
        } else {
            echo "Error: " . $sql_processing . "<br>" . $conn->error;
        }
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    // Insert into processing_data table directly
    $sql_processing = "INSERT INTO processing_data (Filename, Duration_Time, Tesseract_Version, Enhancement_Settings, Page_Segmentation, Image_File_Path) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt_processing = $conn->prepare($sql_processing);
    $stmt_processing->bind_param("sissss", $data['Filename'], $data['Duration_Time'], $data['Tesseract_Version'], $data['Enhancement_Settings'], $data['Page_Segmentation'], $data['Image_File_Path']);  // Updated to use 'image_url'

    if ($stmt_processing->execute()) {
        echo "Data inserted into processing_data successfully\n";
    } else {
        echo "Error: " . $sql_processing . "<br>" . $conn->error;
    }
}

$stmt->close();
$conn->close();
