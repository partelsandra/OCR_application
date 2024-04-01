import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
# from ocr_processing import process_image  # Commented out for now
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Define the upload folder and allowed extensions
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'saved_images')
# OCR_RESULTS_FOLDER = os.path.join(os.path.dirname(__file__), 'ocr_results')  # Commented out for now
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['OCR_RESULTS_FOLDER'] = OCR_RESULTS_FOLDER  # Commented out for now

# Configure logging
logging.basicConfig(filename='error.log', level=logging.DEBUG)  # Log errors to a file
app.logger.setLevel(logging.DEBUG)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'})

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            app.logger.info('File saved successfully')

            # Call process_image function
            # ocr_result = process_image(file_path, app.config['OCR_RESULTS_FOLDER']) 

            # if isinstance(ocr_result, str) and ocr_result.startswith("Error"):
            #     app.logger.error(f'Error processing image: {ocr_result}')
            #     return jsonify({'error': ocr_result})  # Return error message if process_image returns an error
            # else:
            #     app.logger.info('Image processed successfully')
            #     return jsonify({'success': 'File uploaded successfully', 'ocr_result': ocr_result})  # Return success message and OCR result
            return jsonify({'success': 'File uploaded successfully'})  # Return success message
        else:
            app.logger.error('File upload failed')
            return jsonify({'error': 'File upload failed'})
    
    except Exception as e:
        app.logger.exception('An error occurred during file upload')  # Log exception traceback
        return jsonify({'error': 'An error occurred during file upload'})

if __name__ == '__main__':
    app.run(debug=True)
