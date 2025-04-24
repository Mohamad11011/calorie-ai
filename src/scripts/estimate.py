from PIL import Image
import torch
import json
from transformers import ViTFeatureExtractor, ViTForImageClassification,ViTImageProcessor
# Load model and feature extractor
model = ViTForImageClassification.from_pretrained("./public/food")
feature_extractor = ViTImageProcessor.from_pretrained("./public/food")

# Load image
image_path = 'C:/Users/user/Desktop/calorie-ai/public/plate.jpg'  # Use the correct path for the uploaded image
image = Image.open(image_path)

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
