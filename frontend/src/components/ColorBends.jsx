import React, { useEffect, useRef } from 'react';

export const ColorBends = ({
  color = "#A855F7",
  speed = 0.2,
  frequency = 1.0,
  noise = 0.15,
  bandWidth = 0.14,
  rotation = 90,
  fadeTop = 0.75,
  iterations = 1,
  intensity = 1.3,
  className = "",
  style = {}
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const hexToRgb = (hex) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
      };
    };

    const { r, g, b } = hexToRgb(color);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const render = () => {
      time += speed * 0.02;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      // Create flowing wave dynamic gradient background
      const rad = (rotation * Math.PI) / 180;
      const dx = Math.cos(rad) * w;
      const dy = Math.sin(rad) * h;

      const grad = ctx.createLinearGradient(0, 0, dx, dy);

      const stop1 = Math.sin(time * frequency) * 0.1 + 0.2;
      const stop2 = Math.cos(time * frequency * 0.8) * 0.15 + 0.6;

      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.9 * intensity})`);
      grad.addColorStop(Math.max(0, Math.min(1, stop1)), `rgba(${Math.min(255, r + 40)}, ${Math.max(0, g - 20)}, ${Math.min(255, b + 30)}, ${0.75 * intensity})`);
      grad.addColorStop(Math.max(0, Math.min(1, stop2)), `rgba(${Math.max(0, r - 30)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 60)}, ${0.6 * intensity})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${0.85 * intensity})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Add dynamic wave bands
      for (let i = 0; i < iterations; i++) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * intensity})`;
        const waveY = h * (0.3 + 0.4 * Math.sin(time + i));
        ctx.ellipse(w / 2, waveY, w * bandWidth * 4, h * bandWidth * 2, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Apply top fade gradient overlay
      if (fadeTop > 0) {
        const fadeGrad = ctx.createLinearGradient(0, 0, 0, h * fadeTop);
        fadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        fadeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(0, 0, w, h);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [color, speed, frequency, noise, bandWidth, rotation, fadeTop, iterations, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none rounded-2xl ${className}`}
      style={{ zIndex: 0, ...style }}
    />
  );
};

export default ColorBends;
