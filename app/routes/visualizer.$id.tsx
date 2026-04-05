import { useLocation, useNavigate } from "react-router"
import { useEffect, useRef, useState } from "react";
import { generate3DView } from "lib/ai.action";
import

const visualizer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialImage, name } = location.state || {};

  const hasInitialGenerated = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleBack = () => {
    if(!initialImage) return;

    try{
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: initialImage });

      if(result.renderedImage){
      setCurrentImage(result.renderedImage);

      // update the project with the new rendered image

    }
  } catch (error) {
      console.error("Error generating 3D view:", error);
  } finally {
      setIsProcessing(false);
  }
}

  useEffect(() => {
    if(initialImage || hasInitialGenerated.current) return;

    if(!initialRender){
      setCurrentImage(initialRender);
      hasInitialGenerated.current = true;
      return;
    }
    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage, hasInitialGenerated]);

  return (
    <section>
      <h1>{name || 'Untitled project'}</h1>

      <div className="visualizer">
        {initialImage && (
          <div className="image-container">
            <h2>Source Image</h2>
            <img src={initialImage} alt="Source" />
          </div>
        )}
      </div>
    </section>
  )
}

export default visualizer