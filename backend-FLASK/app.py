from flask import Flask, request, jsonify
from langchain.document_loaders import PyPDFLoader
import preprocessPDF
import generateQuiz
import PyPDF2
from flask_cors import CORS, cross_origin 
import base64
import io

app = Flask(__name__)
CORS(app)
def readPDF(pdfFilename):
    loader = PyPDFLoader(pdfFilename)
    data = loader.load()
    book = ""
    for x in data:
        book += x.page_content
    return book

@app.route("/api",methods=['GET'])
@cross_origin()
def index():
    return {
        "tutorial":"hello"
    } 

@app.route('/chunks', methods=['POST'])
@cross_origin()
def process_pdf():
    data = request.get_json()  # Get JSON body of request
    encodings = data.get('encoding')  # Extract pdfName from JSON

    # Ensure that a PDF name was provided
    if not encodings:
        return jsonify({'error': 'Incorrect data'}), 400
    base64_str = encodings.split(',')[1]
    file_data = base64.b64decode(base64_str)
    file_obj = io.BytesIO(file_data)
    pdf_reader = PyPDF2.PdfReader(file_obj)
    text = ''
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text += page.extract_text()
    chunks = preprocessPDF.text_to_doc(text)
    

    return jsonify(chunks), 200  # Returns JSON response
@app.route('/quiz', methods=['POST'])
@cross_origin()
def chunkQuiz():
    data = request.get_json()  # Get JSON body of request
    chunk = data.get('chunk')  # Extract chunk from JSON

    # Ensure that a chunk was provided
    if not chunk:
        return jsonify({'error': 'Incorrect data'}), 400

    questionsMCQs = generateQuiz.mcqGenerate(chunk)
    # questionsFAQs = generateQuiz.faqGenerate(chunk)
    # summary = generateQuiz.generateSummary(chunk)
    questions = questionsMCQs
    # questions = questionsMCQs+questionsFAQs
    
    

    return jsonify({"questions":questions,"summary":"summary"}), 200  # Returns JSON response

@app.route('/quizMCQ', methods=['POST'])
@cross_origin()
def quizMCQs():
    data = request.get_json()  # Get JSON body of request
    chunk = data.get('chunk')  # Extract chunk from JSON

    if not chunk:
        return jsonify({'error': 'Incorrect data'}), 400

    questionsMCQs = generateQuiz.mcqGenerate(chunk)
    questions = questionsMCQs
    
    

    return jsonify({"questionsMCQs":questions}), 200  # Returns JSON response

@app.route('/quizFAQ', methods=['POST'])
@cross_origin()
def quizFAQs():
    data = request.get_json()  # Get JSON body of request
    chunk = data.get('chunk')  # Extract chunk from JSON

    # Ensure that a chunk was provided
    if not chunk:
        return jsonify({'error': 'Incorrect data'}), 400

    questionsFAQs = generateQuiz.faqGenerate(chunk)
    questions = questionsFAQs
    
    

    return jsonify({"questionsFAQs":questions}), 200  # Returns JSON response

@app.route('/summary', methods=['POST'])
@cross_origin()
def quizSummary():
    data = request.get_json()  # Get JSON body of request
    chunk = data.get('chunk')  # Extract chunk from JSON

    # Ensure that a chunk was provided
    if not chunk:
        return jsonify({'error': 'Incorrect data'}), 400
    summary = generateQuiz.generateSummary(chunk)
    
    

    return jsonify({"summary":summary}), 200  # Returns JSON response

@app.route('/gradeFAQ', methods=['POST'])
@cross_origin()
def gradeFAQ():
    data = request.get_json()  # Get JSON body of request
    chunk = data.get('chunk')  # Extract chunk from JSON
    answers = data.get('answers')
    question = data.get('question')
    # Ensure that a chunk was provided
    if not chunk or not answers or not question:
        return jsonify({'error': 'Incorrect data'}), 400
    graded = generateQuiz.faqGrade({"chunk":chunk,"answers":answers,"question":question})
    
    

    return graded, 200  # Returns JSON response

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # run the app on port 5000
    # app.run()  # run the app on port 5000

