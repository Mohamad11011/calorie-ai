from PIL import Image
import torch
import json
import sys
from transformers import ViTFeatureExtractor, ViTForImageClassification,ViTImageProcessor
# Load model and feature extractor
model = ViTForImageClassification.from_pretrained("./public/food")
feature_extractor = ViTImageProcessor.from_pretrained("./public/food")

# Load image
if len(sys.argv) < 2:
    print(json.dumps({"error": "No image path provided"}))
    sys.exit(1)

image_path = sys.argv[1]

image = Image.open(image_path).convert("RGB")

# Preprocess image
inputs = feature_extractor(images=image, return_tensors="pt")
outputs = model(**inputs)
logits = outputs.logits

# Get predictions
predicted = torch.topk(logits, k=5)

# Return top-5 labels
top_labels = [model.config.id2label[i.item()] for i in predicted.indices[0]]
result = {"predictions": top_labels}
print(json.dumps(result))
