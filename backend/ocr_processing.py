import os
import pytesseract
import cv2
import numpy as np
import re
import subprocess
from datetime import datetime
from PIL import Image
import math

def read_config_file(file_path):
    with open(file_path, 'r') as config_file:
        return config_file.read().strip()

def enhance_image(image):
    border_size = 30
    without_borders = image[border_size:-border_size, border_size:-border_size]
    gray = cv2.cvtColor(without_borders, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, None, h=5, templateWindowSize=7, searchWindowSize=21)
    gamma = 0.8
    gamma_corrected = cv2.convertScaleAbs(denoised, alpha=(1 / gamma), beta=0)
    adaptive_thresh = cv2.adaptiveThreshold(gamma_corrected, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                            cv2.THRESH_BINARY, 11, 2)
    return adaptive_thresh

# TEXT CLEANUP
def clean_up_text(original_text):
    # Remove characters other than alphanumeric, dots, commas, and Estonian special characters
    cleaned_text = re.sub(r'[^\w.,öäüõÖÄÜÕ()\s-]', '', original_text)
    # Remove isolated single letters
    cleaned_text = re.sub(r'\b\w\b', '', cleaned_text)
    # Remove isolated pairs of letters
    cleaned_text = re.sub(r'\b\w{2}\b\s*\n\s*\b\w{2}\b', '', cleaned_text)
    
    cleaned_text = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned_text)
    return cleaned_text

def is_list(ocr_text):
    list_patterns = ["1.", "2.", "3.", "a)", "b)", "c)"]
    return any(pattern in ocr_text for pattern in list_patterns)

def is_table(ocr_text):
    table_patterns = ["|"]
    lines = ocr_text.split('\n')
    num_columns = max(len(line.split()) for line in lines)
    if num_columns > 1:
        return any(any(pattern in line for pattern in table_patterns) for line in lines)
    return False


def is_regular_text(ocr_text):
    regular_text_pattern = r'.{20,}' 
    num_line_breaks = ocr_text.count('\n')
    consecutive_lines = max(len(line.strip()) for line in ocr_text.split('\n'))
    return (re.match(regular_text_pattern, ocr_text) is not None 
            and num_line_breaks >= 2 
            and consecutive_lines >= 3)


def determine_psm(ocr_text):
    if is_regular_text(ocr_text):
        return "--psm 3"  
    elif is_list(ocr_text) and not is_table(ocr_text):
        return "--psm 3"  
    elif is_table(ocr_text) and not is_list(ocr_text): 
        return "--psm 6"
    elif is_list(ocr_text) and is_table(ocr_text): 
        return "--psm 6"
    else:
        return "--psm 3"

#Convert filesize to readable form
def convert_bytes_to_human_readable(size_bytes):
    """
    Convert bytes to a human-readable format (e.g., KB, MB, GB).
    """
    if size_bytes == 0:
        return "0 bytes"

    # Define the units and their sizes
    units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    exponent = int(math.log(size_bytes, 1024))
    size = size_bytes / (1024 ** exponent)

    # Format the size
    formatted_size = f"{size:.2f} {units[exponent]}"
    return formatted_size


def process_image(image_path, output_folder):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    config_file_path = os.path.join(script_dir, 'config', 'tesseract_config.txt')
    
    ocr_config = read_config_file(config_file_path)
    
    image = cv2.imread(image_path)

    start_time = datetime.now()  # Start time of processing for duration_time
    
    # Step 1: Initial OCR Without Enhancement
    print(f"Processing image: {image_path}")
    ocr_text = pytesseract.image_to_string(image, config=ocr_config)

    # Initialize PSM value
    psm = None
    
    # Step 2: OCR for Regular Text
    if is_regular_text(ocr_text):
        psm = "--psm 3"
        enhanced_image = image  # No enhancement for regular text
    else:
        # Step 3: Enhancement for Non-Regular Text
        enhanced_image = enhance_image(image)
        ocr_text = pytesseract.image_to_string(enhanced_image, config=ocr_config)
        
        # Step 4: OCR for List or Table
        if is_list(ocr_text) or is_table(ocr_text):
            psm = determine_psm(ocr_text)

    # Apply language and OEM 
    ocr_text = pytesseract.image_to_string(enhanced_image, config=f"{ocr_config} -l est --oem 3")

    # Step 5: Clean up OCR text
    cleaned_text = clean_up_text(ocr_text)

    # Save cleaned OCR result to file
    output_filename = os.path.splitext(os.path.basename(image_path))[0] + '.txt'
    output_path = os.path.join(output_folder, output_filename)
    with open(output_path, 'w') as output_file:
        output_file.write(cleaned_text)

    # Construct relative path to the processed image file
    output_relative_path = os.path.relpath(output_path, script_dir)    
    
    #DATABASE INFO 
    # Get the wxh of the image
    image_width, image_height = Image.open(image_path).size

    # Calculate file size
    file_size = os.path.getsize(image_path)

    # Determine file format
    file_format = os.path.splitext(image_path)[1].replace('.', '')

    # Prepare data to be sent to the database
    processing_date = start_time.strftime('%Y-%m-%d %H:%M:%S')

    # Enhancement applied whether processed image differs from original
    enhancement_applied = not np.array_equal(image, enhanced_image)

    # If enhancement applied, set enhancement status to yes if not no
    enhancement_status = "Yes" if enhancement_applied else "No"

    # Determine page segmentation based on the actual processing result
    if psm:
        page_segmentation = psm.split()[1]
    else:
        page_segmentation = determine_psm(ocr_text).split()[1]

    # Calculate duration time in sec.
    end_time = datetime.now()  # End time of processing for duration_time
    duration_time = (end_time - start_time).total_seconds()

    # Combine wxh for database output
    image_dimensions = f"{image_width}x{image_height}"

    # Calculate file size and convert to readable format
    file_size_bytes = os.path.getsize(image_path)
    file_size = convert_bytes_to_human_readable(file_size_bytes)

    # Calculate duration time in sec
    end_time = datetime.now()  # End time of processing
    duration_time = (end_time - start_time).total_seconds()

    data = {
        'filename': os.path.basename(image_path),
        'processing_date': processing_date,
        'image_size': image_dimensions, 
        'file_size': file_size,
        'file_format': file_format,
        'tesseract_version': pytesseract.get_tesseract_version(),
        'enhancement_settings': enhancement_status,
        'page_segmentation': page_segmentation,
        'duration_time': duration_time,
        'ocr_text': cleaned_text,  
        'image_url': image_path
    }

    # Convert data to string for subprocess
    data_str = ' '.join([f"{key}={value}" for key, value in data.items()])

    # Call the database connection via subprocess
    try:
        process = subprocess.run(['php', 'database_connection.php', data_str], capture_output=True, text=True, timeout=10)
        if process.returncode == 0:
            if "Connected successfully" in process.stdout:
                print("Connected to the database.")
            else:
                print("Failed to connect to the database.")
        else:
            print("Error:", process.stderr)
    except subprocess.TimeoutExpired:
        print("Database connection timed out.")
    except subprocess.CalledProcessError as e:
        print("Error:", e)

    # Return OCR result and image URL
    return cleaned_text, output_path


