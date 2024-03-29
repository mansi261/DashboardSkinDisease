from transformers import CLIPProcessor, CLIPModel
import torch
from PIL import Image
import numpy as np
from scipy.spatial.distance import cosine
import pandas as pd
#import ipywidgets as widgets
#from IPython.display import display, clear_output
import io
import sys
import json



model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Function to preprocess and extract features from an image buffer
def preprocess_and_extract_features(image_buffer):
    image = Image.open(image_buffer).convert("RGB")

    inputs = processor(images=image, return_tensors="pt")
    outputs = model.get_image_features(**inputs)
    return outputs[0].detach().numpy()  # Convert to NumPy array for easier processing

# Load your dataset
data = pd.read_csv('/Users/mansivyas/git_SkinDisease/SkinDiseaseDiagnosticTool/Dataset/skin_disease_embeddings_full.csv')
dataset_texts = data['label'].tolist()  # Column name for descriptive text
dataset_embeddings = data.drop('label', axis=1).values  # Drop the label column to get embeddings

# Function to find the closest matches in the dataset
def find_closest_matches(patient_embedding, dataset_embeddings, top_n=5):
    similarities = [cosine(patient_embedding, emb) for emb in dataset_embeddings]
    closest_indices = np.argsort(similarities)[:top_n]
    return closest_indices

# Main function to process a patient's image and find matches
def diagnose_skin_condition(image_buffer):
    patient_embedding = preprocess_and_extract_features(image_buffer)
    closest_matches = find_closest_matches(patient_embedding, dataset_embeddings)
    matched_descriptions = [dataset_texts[idx] for idx in closest_matches]
    print(matched_descriptions)
    return matched_descriptions

if __name__ == "__main__":
    image_path = sys.argv[1]
    results = diagnose_skin_condition(image_path)
    print(json.dump(results))

#User Interface to upload image
"""upload_button = widgets.FileUpload(
    accept='.jpg,.jpeg,.png',
    multiple=False,
    description='Upload Image'
)

output = widgets.Output()

def on_upload_change(change):
    if not upload_button.value:
        return

    uploaded_file = next(iter(upload_button.value.values()))
    image_buffer = io.BytesIO(uploaded_file['content'])

    matched_descriptions = diagnose_skin_condition(image_buffer)

    with output:
        clear_output()
        display(Image.open(image_buffer))
        for description in matched_descriptions:
            print(f"Predicted Skin condition: {description}")

upload_button.observe(on_upload_change, names='value')

display(upload_button, output)"""
