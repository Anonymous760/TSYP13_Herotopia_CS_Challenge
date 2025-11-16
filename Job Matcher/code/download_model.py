from sentence_transformers import SentenceTransformer
import os

# The model we want to download
MODEL_NAME = 'all-MiniLM-L6-v2'

# The local directory where we will save the model files
LOCAL_MODEL_PATH = './embedding_model'

# Check if the directory already exists
if not os.path.exists(LOCAL_MODEL_PATH):
    print(f"Downloading model '{MODEL_NAME}' to '{LOCAL_MODEL_PATH}'...")

    # Instantiate the model from Hugging Face Hub (this is the download step)
    model = SentenceTransformer(MODEL_NAME)

    # Save the model's files to our specified local path
    model.save(LOCAL_MODEL_PATH)

    print("✅ Model downloaded and saved successfully.")
else:
    print(f"✅ Model directory '{LOCAL_MODEL_PATH}' already exists. Skipping download.")