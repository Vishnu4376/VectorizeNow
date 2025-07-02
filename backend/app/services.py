import io
import base64
from PIL import Image, UnidentifiedImageError
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoProcessor
import time 

try:
    from starvector.data.util import process_and_rasterize_svg
    STARVECTOR_LIB_AVAILABLE = True
except ImportError:
    print("Warning: 'starvector' library not found. Model inference will be simulated.")
    STARVECTOR_LIB_AVAILABLE = False


starvector_model = None
processor = None
tokenizer = None

MODEL_NAME = "starvector/starvector-1b-im2svg"

MAX_IMAGE_SIZE_MB = 5
ALLOWED_IMAGE_MIMETYPES = ["image/png", "image/jpeg"]

def load_starvector_model():
    """
    Attempts to load the StarVector model, processor, and tokenizer from Hugging Face.
    This function is designed to be called once at application startup or first use.
    It will raise a RuntimeError if the model cannot be loaded (e.g., due to PyTorch incompatibility).
    """
    global starvector_model, processor, tokenizer
    if starvector_model is None or processor is None or tokenizer is None:
        if not STARVECTOR_LIB_AVAILABLE:
            raise RuntimeError("'starvector' library not available. Cannot load model.")

        try:
            print(f"Attempting to load StarVector model: {MODEL_NAME}...")
            starvector_model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                torch_dtype=torch.float16, 
                trust_remote_code=True
            )
            processor = starvector_model.model.processor
            tokenizer = starvector_model.model.svg_transformer.tokenizer

            if torch.cuda.is_available():
                starvector_model.cuda()
                print("StarVector model moved to GPU (CUDA).")
            else:
                print("CUDA not available, StarVector model running on CPU.")

            starvector_model.eval() 
            print(f"StarVector model '{MODEL_NAME}' loaded successfully.")
        except Exception as e:
            print(f"Error loading StarVector model: {e}")
            raise RuntimeError(f"Failed to load StarVector model '{MODEL_NAME}': {e}. "
                               "This might be due to Python/PyTorch version incompatibility "
                               "or missing dependencies. Model output will be simulated.")

def convert_image_to_svg(image_data_base64: str) -> str:
    """
    Decodes a base64 image, performs validation, and either processes it using the
    loaded StarVector model or returns a simulated SVG string if the model cannot be loaded.
    """
    try:
        # 1. Decode base64 image data into bytes
        image_bytes = base64.b64decode(image_data_base64)

        # 2. Image Validation
        # Check image size
        if len(image_bytes) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
            raise ValueError(f"Image size exceeds {MAX_IMAGE_SIZE_MB}MB limit.")

        # Use BytesIO to create a file-like object from bytes
        image_stream = io.BytesIO(image_bytes)
        image_pil = None 
        try:
            image_pil = Image.open(image_stream)
        except UnidentifiedImageError:
            raise ValueError("Invalid image file or unsupported format. Only PNG and JPEG are allowed.")
        except IOError as e:
            raise ValueError(f"Corrupted image data or I/O error: {e}")
        except Exception as e:
            raise ValueError(f"An unexpected error occurred while opening the image: {e}")

        if image_pil is None:
            raise ValueError("Failed to open image: image_pil object is None.")

        detected_format = image_pil.format.lower()
        mime_type = None
        if detected_format == 'png':
            mime_type = 'image/png'
        elif detected_format == 'jpeg' or detected_format == 'jpg': 
            mime_type = 'image/jpeg'

        if mime_type not in ALLOWED_IMAGE_MIMETYPES:
            raise ValueError(f"Unsupported image format: {detected_format}. Only PNG and JPEG are allowed.")

        if image_pil.mode != 'RGB':
            image_pil = image_pil.convert("RGB")
            
        width, height = image_pil.size

        print("Simulating long-running image processing (3 seconds delay)...")
        time.sleep(3) 

        try:
            if starvector_model is None or processor is None or tokenizer is None:
                load_starvector_model() 

            print("Performing actual StarVector inference...")
            image_tensor = processor(image_pil, return_tensors="pt")['pixel_values']

            if not image_tensor.shape[0] == 1:
                image_tensor = image_tensor.unsqueeze(0)

            if torch.cuda.is_available():
                image_tensor = image_tensor.cuda()

            batch = {"image": image_tensor}

            with torch.no_grad():
                raw_svg_list = starvector_model.generate_im2svg(batch, max_length=4000)
            raw_svg = raw_svg_list[0]

            svg_code, _ = process_and_rasterize_svg(raw_svg)
            print("Actual SVG generation complete.")
            return svg_code

        except RuntimeError as e:
            print(f"Model inference failed: {e}. Returning simulated SVG.")
            simulated_svg = f"<svg width='{width}' height='{height}' viewBox='0 0 {width} {height}' xmlns='http://www.w3.org/2000/svg'>" \
                            f"<rect x='0' y='0' width='{width}' height='{height}' fill='#f0f0f0' stroke='#ccc' stroke-width='1'/>" \
                            f"<circle cx='{width/4}' cy='{height/4}' r='{min(width, height)/8}' fill='#ff6347'/>" \
                            f"<rect x='{width/2}' y='{height/2}' width='{width/4}' height='{height/4}' fill='#4682b4' rx='5' ry='5'/><polygon points='{width*0.75},{height*0.25} {width*0.85},{height*0.5} {width*0.65},{height*0.5}' fill='#32cd32'/>" \
                            f"<text x='{width/2}' y='{height*0.9}' font-family='Arial, sans-serif' font-size='{min(width,height)/10}' fill='#555' text-anchor='middle'>Simulated SVG ({width}x{height})</text>" \
                            f"<!-- Note: StarVector model could not be loaded due to environment issues (e.g., Python/PyTorch incompatibility). This is a simulated output. -->" \
                            f"</svg>"
            return simulated_svg
        except Exception as e:
            print(f"Unexpected error during StarVector inference attempt: {e}. Returning simulated SVG.")
            simulated_svg = f"<svg width='{width}' height='{height}' viewBox='0 0 {width} {height}' xmlns='http://www.w3.org/2000/svg'>" \
                            f"<rect x='0' y='0' width='{width}' height='{height}' fill='#f0f0f0' stroke='#ccc' stroke-width='1'/>" \
                            f"<text x='{width/2}' y='{height/2}' font-family='Arial, sans-serif' font-size='{min(width,height)/10}' fill='red' text-anchor='middle'>Error simulating SVG</text>" \
                            f"<!-- Unexpected error during model attempt: {e} -->" \
                            f"</svg>"
            return simulated_svg

    except ValueError as e:
        print(f"Validation Error: {e}")
        raise ValueError(f"Image processing failed: {e}")
    except Exception as e:
        print(f"Critical error in convert_image_to_svg: {e}")
        raise ValueError(f"A critical error occurred during image conversion: {e}")