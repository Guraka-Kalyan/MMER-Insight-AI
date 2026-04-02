# 👁️ Insight AI — See Beyond the Surface

![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3.3-black?style=for-the-badge&logo=flask)
![Next.js](https://img.shields.io/badge/Next.js-14-white?style=for-the-badge&logo=nextdotjs)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)

**Insight AI** is a professional-grade multimodal emotion recognition system developed as a final year college project. It leverages deep learning and computer vision to decode human emotions across four distinct input modalities: **Text, Audio, Images,** and **Live Video**.

## 🛠️ Tech Stack

### 🖥️ Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Deployment**: Vercel

### ⚙️ Backend
*   **Framework**: Flask 2.3.3
*   **Communication**: Flask-CORS
*   **Server**: Gunicorn (WSGI)
*   **Hosting**: AWS EC2 (Ubuntu t2.micro)

### 🧠 ML & AI Core
*   **Deep Learning**: TensorFlow 2.12+, PyTorch 1.7+
*   **CV/Image Processing**: OpenCV (opencv-python-headless)
*   **Emotion Detection**: FER (Facial Expression Recognition) with MTCNN (Multi-task Cascaded Convolutional Networks)
*   **Speech Services**: Google Speech-to-Text via `SpeechRecognition`
*   **Media Processing**: FFmpeg (System dependency)

---

## 🔍 How Each Modality Works

### 📄 Text Analysis
Uses an NLP-driven approach where the backend parses input text through a weighted keyword-scoring algorithm. It evaluates the presence of emotional markers to calculate probabilities for all 7 target emotions.

### 🎙️ Audio Analysis
1.  **Capture**: Browser records voice via the `MediaRecorder API` as a `.webm` file.
2.  **Conversion**: Flask receives the stream and uses `ffmpeg` to convert it to a standard `.wav` format.
3.  **STT**: Google Speech Recognition transcribes the audio into text.
4.  **Inference**: The transcribed text is passed through the keyword-based analysis engine.

### 🖼️ Image Analysis
Analyzes static facial uploads. The backend saves the image, and **FER** (utilizing **MTCNN**) identifies faces. If multiple individuals are detected, the system averages the scores across all faces to provide a collective sentiment analysis.

### 📹 Video Analysis (Real-time)
A continuous tracking system that utilizes the browser's `getUserMedia()` API. It captures a frame every 3 seconds, sends it to the `/predict_image` endpoint, and applies **exponential smoothing (alpha=0.7)** to the result stream to ensure smooth, real-time UI updates without flickering.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Homepage route | N/A |
| `POST` | `/predict_text` | Analyzes text sentiment | `{ "text": "..." }` |
| `POST` | `/predict_audio` | Processes voice recordings | `multipart/form-data` |
| `POST` | `/predict_image` | Decodes facial expressions | `multipart/form-data` |
| `GET` | `/text` | Text analysis interface | N/A |
| `GET` | `/audio` | Audio analysis interface | N/A |
| `GET` | `/image` | Image analysis interface | N/A |
| `GET` | `/video` | Live video interface | N/A |

---

## 🎭 Emotions Detected

The system categorizes inputs into 7 universal categories:

| Emotion | UI Color Hex | Description |
| :--- | :--- | :--- |
| **Happy** | `#F59E0B` | Joy, satisfaction, or positive sentiment |
| **Sad** | `#4F8EF7` | Sorrow, disappointment, or negative sentiment |
| **Angry** | `#FF2D55` | Frustration, rage, or aggressive sentiment |
| **Fear** | `#8B5CF6` | Anxiety, dread, or wary sentiment |
| **Surprise** | `#84CC16` | Shock, amazement, or unexpected sentiment |
| **Disgust** | `#10B981` | Aversion, revulsion, or critical sentiment |
| **Neutral** | `#94A3B8` | Absence of strong emotion |

---

## 📂 Project Structure

```bash
insight-ai/
├── backend/
│   ├── app.py             # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   └── uploads/           # Temporary storage for analysis
├── frontend/
│   ├── app/
│   │   ├── page.tsx       # Next.js Landing Page
│   │   └── dashboard/
│   │       └── page.tsx   # Integrated Analysis Dashboard
│   ├── components/        # Reusable UI components
│   ├── public/            # Static assets (Favicon, Logo)
│   ├── package.json       # Node.js configuration
│   └── next.config.js     # Next.js configuration
└── README.md              # Documentation
```

---

## ⚙️ Installation Instructions

### 📋 Prerequisites
*   Python 3.10+
*   Node.js 18+
*   [FFmpeg](https://ffmpeg.org/download.html) installed on your system path
*   Git

### 🐍 Backend Setup (Flask)
```bash
# 1. Navigate to backend folder
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the server
python app.py
```
*Backend will run at `http://localhost:5000`*

### ⚛️ Frontend Setup (Next.js)
```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Setup environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# 4. Start development server
npm run dev
```
*Frontend will run at `http://localhost:8080`*

---

## ⚠️ Known Limitations
*   **Engine Logic**: Text and audio detection currently utilize keyword matching rather than complex transformers.
*   **Tone Analysis**: Audio emotion is derived from speech transcripts; literal tone/pitch analysis is not implemented.
*   **Viewport**: The dashboard is optimized strictly for **desktop screens** (min 1024px).
*   **Resource Management**: AWS EC2 t2.micro (1GB RAM) may experience slow initial loads due to ML model memory allocation.

---

## ☁️ Deployment

### **Frontend (Vercel)**
- Connect your repository to Vercel.
- Configure `NEXT_PUBLIC_API_URL` to point to your EC2 public IP.
- Vercel handles CI/CD for every push to `main`.

### **Backend (AWS EC2)**
- Instance: Ubuntu t2.micro.
- Setup: Install Python, FFmpeg, and `pip` dependencies.
- Use Gunicorn for production:
  ```bash
  gunicorn -w 2 -b 0.0.0.0:5000 app:app
  ```
- Ensure Port **5000** is open in your Security Group.

---



---

## 📜 License
This project is licensed under the **MIT License**.

---

## 🤝 Contributing
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
