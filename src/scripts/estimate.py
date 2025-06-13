from PIL import Image
import torch
import json
import sys
from transformers import ViTForImageClassification, ViTImageProcessor

# Load model and feature extractor
model = ViTForImageClassification.from_pretrained("./public/food")
feature_extractor = ViTImageProcessor.from_pretrained("./public/food")

# Load image
if len(sys.argv) < 2:
    print(json.dumps({"error": "No image path provided"}))
    sys.exit(1)

image_path = sys.argv[1]
reference = sys.argv[2] if len(sys.argv) > 2 else None

image = Image.open(image_path).convert("RGB")

# Preprocess image
inputs = feature_extractor(images=image, return_tensors="pt")
outputs = model(**inputs)
logits = outputs.logits

# Get probabilities
probs = torch.nn.functional.softmax(logits, dim=1)

# Get top-5 predictions
top_probs, top_indices = torch.topk(probs, k=5)

# Return top-5 labels and confidences
results = []
for i in range(5):
    label = model.config.id2label[top_indices[0][i].item()]
    confidence = top_probs[0][i].item()
    results.append({"label": label, "confidence": confidence})

# Add reference to output for debugging
print(json.dumps({"predictions": results, "reference": reference}))
