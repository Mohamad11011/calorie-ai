import sys
import json
import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import resnet50, ResNet50_Weights

def load_model():
    # Load pre-trained ResNet model
    model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
    model.eval()
    return model

def preprocess_image(image_path):
    # Load and preprocess the image
    image = Image.open(image_path).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    return transform(image).unsqueeze(0)

def get_food_classes():
    # Map ImageNet class indices to food items
    # This is a simplified mapping - you should expand this based on your needs
    food_classes = {
        47: 'apple',
        53: 'banana',
        55: 'orange',
        963: 'pizza',
        933: 'hamburger',
        987: 'salad',
        932: 'sandwich',
        963: 'pasta',
        978: 'rice',
        8: 'chicken',
        927: 'beans',
    }
    return food_classes

def detect_food(image_path):
    try:
        # Load model and image
        model = load_model()
        image_tensor = preprocess_image(image_path)
        
        # Get predictions
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
        # Get top 3 predictions
        top3_prob, top3_catid = torch.topk(probabilities, 3)
        food_classes = get_food_classes()
        
        # Filter for food items only
        detected_foods = []
        for prob, catid in zip(top3_prob, top3_catid):
            if catid.item() in food_classes:
                detected_foods.append(food_classes[catid.item()])
        
        # Return results as JSON
        print(json.dumps(detected_foods))
        
    except Exception as e:
        print(json.dumps([]), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python detect_food.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    detect_food(image_path) 