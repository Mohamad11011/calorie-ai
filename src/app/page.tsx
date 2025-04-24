'use client'
import { useState } from 'react';

const Home = () => {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    
    const formData = new FormData();
    formData.append("image", image);
    
    const response = await fetch("/api/estimate", {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    setResult(data.result);
  };

  return (
    <div>
      <h1>Calorie Estimation</h1>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Estimate Calories</button>
      
      {result && (
        <div>
          <h2>Results:</h2>
          <pre>{result?.predictions}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
