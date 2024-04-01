import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import logging
from flask_cors import CORS

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

if __name__ == '__main__':
    app.run(debug=True)
