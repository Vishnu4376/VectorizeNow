import base64
import os

image_path = "C:/Users/DELL/Desktop/downloader.png"
if not os.path.exists(image_path):
    print(f"Error: Image file not found at '{image_path}'")
    print("Please update the 'image_path' variable in this script to your actual image file.")
else:
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        print("--- COPY THIS BASE64 STRING ---")
        print(encoded_string)
        print("-------------------------------")
    except Exception as e:
        print(f"An error occurred during conversion: {e}")