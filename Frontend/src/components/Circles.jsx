import { useEffect } from 'react';

function BackgroundCircles() {
  useEffect(() => {
    const generateCircles = () => {
      const body = document.body;
      const circle = document.createElement('div');
      circle.classList.add('circle');
      
      const size = Math.random() * 80 + 20;
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
      
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      circle.style.top = `${y}px`;
      circle.style.left = `${x}px`;
      
      circle.style.backgroundColor = 'white';
      circle.style.opacity = 0.1; // Slightly transparent for a diffused look
      circle.style.borderRadius = '50%'; // Making it a circle shape
      circle.style.position = 'absolute'; // Absolute positioning within the viewport
      circle.style.zIndex = '-1'; // Ensures the circles are behind other content
      circle.style.boxShadow = `0px 0px ${size / 2}px 0px rgba(255, 255, 255, 0.5)`; // Soft glowing effect

      body.appendChild(circle);
      
      setTimeout(() => {
        body.removeChild(circle);
      }, 20000);
    };

    const intervalId = setInterval(generateCircles, 500);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}

export default BackgroundCircles;
