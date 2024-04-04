from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import logging
from flask_cors import CORS
from ocr_processing import process_image
import threading

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'saved_images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

logging.basicConfig(filename='error.log', level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return 'No file part', 400

        file = request.files['file']
        if file.filename == '':
            return 'No selected file', 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            app.logger.info('File saved successfully')

            return 'File uploaded successfully', 200
        else:
            app.logger.error('File upload failed')
            return 'File upload failed', 400
    
    except Exception as e:
        app.logger.exception('An error occurred during file upload: {}'.format(str(e)))
        return 'An error occurred during file upload', 500

ocr_result = None

@app.route('/process', methods=['POST'])
def process_image_request():
    try:
        if 'filename' not in request.json:
            return jsonify({'error': 'Filename not provided'}), 400

        filename = request.json['filename']
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # Process the image in a separate thread
        threading.Thread(target=process_image_async, args=(file_path,)).start()

        return jsonify({'status': 'processing'}), 200
    except Exception as e:
        app.logger.exception('An error occurred during image processing: {}'.format(str(e)))
        return jsonify({'error': 'An error occurred during image processing'}), 500

def process_image_async(file_path):
    global ocr_result
    ocr_result = process_image(file_path, app.config['UPLOAD_FOLDER'])

@app.route('/ocr_status', methods=['POST'])
def ocr_status():
    global ocr_result
    try:
        if ocr_result:
            return jsonify({
                'status': 'complete',
                'ocr_result': ocr_result
            }), 200
        else:
            return jsonify({
                'status': 'processing'
            }), 200
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
