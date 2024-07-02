
# PDF Quiz

https://github.com/daniyal-ahmad-khan/PDF-Quiz/assets/60844063/6b0616f5-e37b-42f6-b7e0-ce21fc85e4b9



The PDF Quiz Application is an innovative tool designed to transform PDF documents into interactive quizzes, enhancing the learning and assessment process. This application seamlessly integrates a `React-Frontend` for user interaction with a `Flask-Backend` for processing, creating a dynamic and engaging educational experience.

## Features

- **PDF Preprocessing:** Efficiently parses and segments PDF documents into manageable chunks for further processing.
- **Quiz Generation:** Automatically generates multiple-choice and open-ended questions from the PDF content, complete with correct answers and detailed explanations.

## Getting Started

### Prerequisites

- Python >=3.9
- Node.js and npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   https://github.com/DaniyalAhmadKhan-LUMS/PDF-Quiz.git
2. **Set up the Flask-Backend**
   Navigate to the Flask-Backend directory and install the required Python dependencies.
   ```bash
   cd Flask-Backend
   ```
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up the React-Frontend**
   Navigate to the React-Frontend directory and install the required JavaScript dependencies.
   ```bash
   cd ../React-Frontend
   ```
   ```bash
   npm install
   ```
### Running the Application
1. **Start the Flask-Backend**
   ```bash
   python app.py
   ```
2. **Launch the React-Frontend**
   Open a new terminal window and run:
   ```bash
   npm start
   ```
   Visit `http://localhost:3000` in your browser to access the application.
## Architecture
### Flask-Backend
The Flask-Backend consists of two main components:
1. **PDF Preprocessing:**
   * **Reading PDFs:** Utilizes `PyPDF2` and `langchain.document_loader.PyPDFLoader` for efficient PDF parsing.
   * **Segmentation:** Employs `langchain.text_splitter.RecursiveCharacterTextSplitter` to divide the PDF into smaller, processable chunks.
2. **Quiz Generation**
   * **Summary Generation:** Produces summaries for each text chunk, aiding users in understanding the context.
   * **Question Creation:** Generates both multiple-choice and open-ended questions from text chunks.
   * **Grading:** Automatically grades user responses, providing feedback on their answers.
  
## License
This project is licensed under the MIT License - see the LICENSE file for details.
