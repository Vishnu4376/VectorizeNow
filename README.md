VectorizeNow: Image to SVG Converter
Transform Your Images into Scalable Vector Graphics

Table of Contents
Introduction

Features

Technologies Used

Setup & Installation

Prerequisites

Backend Setup

Frontend Setup

Running the Application

Start Backend

Start Frontend

Important Note: StarVector Model (Simulation vs. Real)

Future Enhancements

Troubleshooting Tips

License

1. Introduction
VectorizeNow is a full-stack web application designed to convert raster images (like PNG and JPEG) into scalable vector graphics (SVG). This project serves as a demonstration of a modern web architecture, integrating a React-based frontend with a FastAPI/Graphene (GraphQL) backend. While the core AI model (StarVector) for image vectorization is currently simulated due to specific hardware/environment requirements, the application fully showcases robust image handling, API communication, and an intuitive user experience.

2. Features
Image Upload: Easily upload PNG and JPEG images.

Image Preview: See a live preview of your selected image before conversion.

Backend Validation: Robust validation for image file type (PNG/JPEG) and size (up to 5MB).

Simulated SVG Generation: The backend provides a dynamic, simulated SVG output, demonstrating the full application flow.

SVG Display: View the generated SVG directly in the browser.

SVG Code Access: Copy the raw SVG code to your clipboard.

SVG Download: Download the generated SVG as a .svg file.

Responsive UI/UX: A clean, modern, and fully responsive user interface built with Tailwind CSS.

Loading States: Clear visual feedback during the conversion process.

3. Technologies Used
Frontend:
React: A JavaScript library for building user interfaces.

Vite: A fast build tool that provides a rapid development environment.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

Apollo Client: A comprehensive state management library for GraphQL.

Backend:
FastAPI: A modern, fast (high-performance) web framework for building APIs with Python 3.7+.

Graphene: A Python library for building GraphQL APIs.

Pillow (PIL Fork): For image processing and validation.

transformers: Hugging Face's library (used for conceptual integration of StarVector model).

torch (PyTorch): Deep learning framework (required for flash_attn and starvector).

flash_attn: Optimized attention mechanism (critical dependency for StarVector).

starvector: The core image-to-SVG deep learning model (currently simulated).

4. Setup & Installation
Follow these steps to get the project running on your local machine.

Prerequisites
Python 3.10 (64-bit): Recommended version for compatibility with deep learning libraries.

Important: Ensure Python 3.10 is added to your system's PATH during installation.

Node.js (LTS version) & npm: For the frontend development.

NVIDIA GPU (Optional but Recommended for Actual StarVector): A dedicated NVIDIA graphics card with CUDA support (e.g., RTX 3050 or higher).

NVIDIA CUDA Toolkit (v11.8 recommended): Download and install from NVIDIA Developer. Choose the 11.8.0 version.

NVIDIA cuDNN (v8.9.7 for CUDA 11.x recommended): Download and install from NVIDIA cuDNN. Requires NVIDIA Developer account. Extract the zip and copy bin, include, lib folders into your CUDA Toolkit installation directory (e.g., C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8).

Microsoft Visual C++ Build Tools: Required for compiling flash_attn on Windows. Download from Visual Studio. During installation, select the "Desktop development with C++" workload. Restart your computer after installation.

Backend Setup
Open a new Command Prompt.

Navigate to the backend directory of your project:

cd C:\Users\shivshankar\Downloads\Telegram Desktop\Ecosight project\backend

(Adjust path if your project is located elsewhere)

Delete old virtual environment (if any, for a clean start):

rmdir /s /q venv

Create a new Python virtual environment:

python -m venv venv

Activate the virtual environment:

venv\Scripts\activate

(You should see (venv) at the start of your prompt)

Install PyTorch with CUDA 11.8 support:

pip --default-timeout=1000 install torch==2.3.1+cu118 torchvision==0.18.1+cu118 torchaudio==2.3.1+cu118 --index-url https://download.pytorch.org/whl/cu118

If this command times out, ensure your internet connection is stable and try again. You can also try pip cache purge before retrying.

Verify PyTorch CUDA installation:

python -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.device_count()); print(torch.cuda.get_device_name(0))"

(Expected output: True, 1, NVIDIA GeForce RTX ...)

Install setuptools (required for flash_attn compilation):

pip install setuptools

Close your current Command Prompt.

Open "Developer Command Prompt for VS 2022" (as Administrator).

Navigate to your backend directory and activate venv again in this new prompt:

cd C:\Users\shivshankar\Downloads\Telegram Desktop\Ecosight project\backend
venv\Scripts\activate

Set environment variable for compilation:

set DISTUTILS_USE_SDK=1

Install flash_attn:

pip install flash-attn==2.5.8 --no-build-isolation

This step will compile CUDA code and may take several minutes. Watch for successful compilation.

Install remaining backend dependencies:

pip install -r requirements.txt

Frontend Setup
Open a new Command Prompt.

Navigate to the frontend directory of your project:

cd C:\Users\shivshankar\Downloads\Telegram Desktop\Ecosight project\frontend

(Adjust path if your project is located elsewhere)

Install frontend dependencies:

npm install

5. Running the Application
Ensure you have two separate Command Prompt windows open: one for the backend and one for the frontend.

Start Backend
In the backend Command Prompt (with (venv) active):

python -m uvicorn main:app --reload

The backend will run on http://127.0.0.1:8000.

Start Frontend
In the frontend Command Prompt:

npm run dev

The frontend will run on http://localhost:5173. Open this URL in your web browser.

6. Important Note: StarVector Model (Simulation vs. Real)
The core of this project involves the starvector deep learning model for image-to-SVG conversion. Due to its dependency on flash_attn, which requires a specific NVIDIA GPU, CUDA Toolkit, and compatible system setup for compilation, the model's inference is currently simulated in the backend/app/services.py.

When you upload an image, the backend will perform basic validation and then, instead of running the actual AI model, it will generate a dynamic placeholder SVG (a red circle, blue square, green triangle, and text indicating "Simulated SVG").

This simulation serves to demonstrate the full application architecture, including frontend-backend communication, GraphQL API usage, robust error handling, and UI/UX, even when the complex AI component cannot be fully deployed in all environments.

The time.sleep(3) in services.py simulates the typical latency of a real AI inference, allowing the frontend's loading spinner to be visible.

7. Future Enhancements
Actual StarVector Integration: Fully enable the StarVector model once the necessary hardware and software environment are consistently available.

SVG Interaction: Add features like zoom, pan, and basic editing capabilities for the displayed SVG.

User Accounts & History: Implement user authentication and store conversion history in a database.

More Output Options: Allow users to customize vectorization parameters or choose different output styles.

Asynchronous Task Queue: Integrate a task queue (e.g., Celery) for true background processing of long-running conversions.

8. Troubleshooting Tips
"Error: Failed to fetch" on Frontend:

Ensure both backend (uvicorn) and frontend (npm run dev) servers are running in separate terminals.

Check your backend console for any errors during startup or when a request is made.

Verify CORS configuration in backend/main.py.

Python/Pip Errors during Installation:

TimeoutError: Your internet connection might be unstable or slow. Try pip --default-timeout=1000 install ... or a more stable network.

No matching distribution found: The specified PyTorch/Python version combination might not have pre-built wheels available. Check PyTorch's website for compatible versions.

ModuleNotFoundError: No module named 'setuptools' / 'psutil': Install the missing module (e.g., pip install setuptools or pip install psutil) and retry.

error: Microsoft Visual C++ 14.0 or greater is required: Ensure "Desktop development with C++" is installed in Visual Studio Build Tools and you are running commands from a "Developer Command Prompt for VS 2022" (as Administrator). Also, ensure set DISTUTILS_USE_SDK=1 is run in that prompt.

build\lib.win32-cpython-312 (or similar 32-bit build path on a 64-bit system): This indicates a Python architecture mismatch. Reinstall Python 3.10 (64-bit) and ensure it's added to PATH, and remove older Python PATH entries.[VectorizeNow_ReadMe.pdf](https://github.com/user-attachments/files/21022582/VectorizeNow_ReadMe.pdf)
FOR DETAILED AND BREIF EXPLAINATION REFER THIS PDF: [VectorizeNow_ReadMe.pdf](https://github.com/user-attachments/files/21022588/VectorizeNow_ReadMe.pdf)

