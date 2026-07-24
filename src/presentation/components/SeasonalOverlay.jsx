import React, { useEffect, useRef, useMemo } from "react";

const Season = {
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  MONSOON: "MONSOON",
  AUTUMN: "AUTUMN",
  WINTER: "WINTER"
};

const getCurrentSeason = () => {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  switch (month) {
    case 1: // Feb
    case 2: // Mar
      return Season.SPRING;
    case 3: // Apr
    case 4: // May
    case 5: // Jun
      return Season.SUMMER;
    case 6: // Jul
    case 7: // Aug
      return Season.MONSOON;
    case 8: // Sep
    case 9: // Oct
    case 10: // Nov
      return Season.AUTUMN;
    default:
      return Season.WINTER;
  }
};

export const getSeasonalGradientClass = () => {
  const season = getCurrentSeason();
  switch (season) {
    case Season.SPRING:
      return "bg-gradient-to-b from-[#FDF2F8] to-[#FCE7F3]"; // Soft pinks
    case Season.SUMMER:
      return "bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]"; // Warm yellows
    case Season.MONSOON:
      return "bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0]"; // Rainy slate/blue
    case Season.AUTUMN:
      return "bg-gradient-to-b from-[#FFF7ED] to-[#FFFFEDD5]"; // Orange/peach
    case Season.WINTER:
    default:
      return "bg-gradient-to-b from-[#F0FDF4] to-[#E0F2FE]"; // Icy mint/blue
  }
};

export const SeasonalOverlay = ({ categoryName = "" }) => {
  const canvasRef = useRef(null);
  const season = useMemo(() => getCurrentSeason(), []);
  
  const isFreezing = useMemo(() => {
    return season === Season.SUMMER && 
      (categoryName.toLowerCase().includes("ice") || categoryName.toLowerCase().includes("beverage"));
  }, [season, categoryName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let animationId;
    let particles = [];
    
    const handleResize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);

    const particleCount = isFreezing ? 40 : {
      [Season.WINTER]: 35,
      [Season.SPRING]: 18,
      [Season.MONSOON]: 45,
      [Season.AUTUMN]: 18,
      [Season.SUMMER]: 20
    }[season] || 20;

    class Particle {
      constructor(initial = false) {
        this.reset(initial);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : -10;
        
        switch (season) {
          case Season.WINTER:
            this.size = 2 + Math.random() * 5;
            this.speedX = -1 + Math.random() * 2;
            this.speedY = 1.5 + Math.random() * 2.5;
            this.alpha = 0.4 + Math.random() * 0.4;
            this.color = "rgba(255, 255, 255, " + this.alpha + ")";
            break;
          case Season.SPRING:
            this.size = 5 + Math.random() * 5;
            this.speedX = -1 + Math.random() * 2;
            this.speedY = 1 + Math.random() * 1.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = -1 + Math.random() * 2;
            this.alpha = 0.6 + Math.random() * 0.3;
            this.color = Math.random() > 0.5 ? "rgba(244, 114, 182, " + this.alpha + ")" : "rgba(251, 207, 232, " + this.alpha + ")"; // Pink
            break;
          case Season.MONSOON:
            this.size = 1 + Math.random() * 2; // thin rain line width
            this.length = 8 + Math.random() * 10;
            this.speedX = -0.5 + Math.random() * 1;
            this.speedY = 6 + Math.random() * 5;
            this.alpha = 0.3 + Math.random() * 0.4;
            this.color = "rgba(147, 197, 253, " + this.alpha + ")";
            break;
          case Season.AUTUMN:
            this.size = 6 + Math.random() * 6;
            this.speedX = 0.5 + Math.random() * 2;
            this.speedY = 1.5 + Math.random() * 2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = 0.5 + Math.random() * 3;
            this.alpha = 0.6 + Math.random() * 0.3;
            this.color = Math.random() > 0.5 ? "rgba(245, 158, 11, " + this.alpha + ")" : "rgba(180, 83, 9, " + this.alpha + ")"; // Amber/Brown
            break;
          case Season.SUMMER:
          default:
            if (isFreezing) {
              this.size = 2 + Math.random() * 3;
              this.speedX = -0.2 + Math.random() * 0.4;
              this.speedY = 0.6 + Math.random() * 1.2;
              this.alpha = 0.5 + Math.random() * 0.5;
              this.color = "rgba(255, 255, 255, " + this.alpha + ")";
            } else {
              // Floating heat/dust/solar circles going upwards
              this.size = 1.5 + Math.random() * 3.5;
              this.x = Math.random() * canvas.width;
              this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
              this.speedX = -0.3 + Math.random() * 0.6;
              this.speedY = -(0.5 + Math.random() * 1);
              this.alpha = 0.2 + Math.random() * 0.3;
              this.color = "rgba(253, 224, 71, " + this.alpha + ")"; // light yellow
            }
            break;
        }
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.rotation !== undefined) {
          this.rotation += this.rotationSpeed * 0.01;
        }

        // Boundary checks
        if (season === Season.SUMMER && !isFreezing) {
          if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
          }
        } else {
          if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
          }
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.rotation !== undefined) {
          ctx.rotate(this.rotation);
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        switch (season) {
          case Season.WINTER:
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case Season.SPRING:
            // Blossom petal shape
            ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case Season.MONSOON:
            // Rain line
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size;
            ctx.moveTo(0, -this.length / 2);
            ctx.lineTo(0, this.length / 2);
            ctx.stroke();
            break;
          case Season.AUTUMN:
            // Oval leaf shape
            ctx.ellipse(0, 0, this.size, this.size / 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case Season.SUMMER:
          default:
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        ctx.restore();
      }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw frost borders if freezing
      if (isFreezing) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        
        // Top frost path
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height * 0.08);
        ctx.lineTo(canvas.width * 0.8, canvas.height * 0.04);
        ctx.lineTo(canvas.width * 0.6, canvas.height * 0.1);
        ctx.lineTo(canvas.width * 0.4, canvas.height * 0.05);
        ctx.lineTo(canvas.width * 0.2, canvas.height * 0.09);
        ctx.lineTo(0, canvas.height * 0.06);
        ctx.closePath();
        ctx.fill();

        // Bottom frost path
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(canvas.width, canvas.height * 0.92);
        ctx.lineTo(canvas.width * 0.8, canvas.height * 0.96);
        ctx.lineTo(canvas.width * 0.6, canvas.height * 0.9);
        ctx.lineTo(canvas.width * 0.4, canvas.height * 0.95);
        ctx.lineTo(canvas.width * 0.2, canvas.height * 0.91);
        ctx.lineTo(0, canvas.height * 0.94);
        ctx.closePath();
        ctx.fill();
      }

      // Draw and update particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [season, isFreezing]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70"
    />
  );
};
