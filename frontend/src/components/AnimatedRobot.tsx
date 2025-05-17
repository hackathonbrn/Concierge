
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedRobotProps {
  isTalking: boolean;
  isThinking: boolean;
  isCelebrating?: boolean;
  isDenied?: boolean;
}

const AnimatedRobot: React.FC<AnimatedRobotProps> = ({ 
  isTalking, 
  isThinking,
  isCelebrating = false,
  isDenied = false
}) => {
  const [blinking, setBlinking] = useState(false);

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 3000 + 2000); // Random blink every 2-5 seconds
    
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative w-48 h-48 lg:w-64 lg:h-64 animate-float">
      {/* Robot head */}
      <div className={cn(
        "relative w-full h-full rounded-3xl bg-gradient-to-br from-robot-secondary to-robot-primary shadow-lg transition-all duration-300",
        isThinking ? "animate-pulse-glow" : "",
        isCelebrating ? "from-green-500 to-green-700" : "",
        isDenied ? "from-red-500 to-red-700" : ""
      )}>
        {/* Robot eyes */}
        <div className="absolute flex justify-between w-3/5 left-1/5 top-1/4">
          <div className={cn(
            "w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center",
            blinking ? "animate-blink" : ""
          )}>
            <div className="w-4 h-4 lg:w-6 lg:h-6 rounded-full bg-black"></div>
          </div>
          <div className={cn(
            "w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center",
            blinking ? "animate-blink" : ""
          )}>
            <div className="w-4 h-4 lg:w-6 lg:h-6 rounded-full bg-black"></div>
          </div>
        </div>

        {/* Robot mouth */}
        <div className="absolute w-2/3 left-1/6 bottom-1/4 flex justify-center">
          <div className={cn(
            "w-16 h-2 lg:w-20 lg:h-3 rounded-full bg-white transition-all duration-100",
            isTalking ? "animate-talk" : "animate-none"
          )}></div>
        </div>
        
        {/* Robot antenna */}
        <div className="absolute w-3 h-10 lg:w-4 lg:h-12 bg-robot-accent rounded-full left-1/2 transform -translate-x-1/2 -top-8 lg:-top-10">
          <div className="absolute w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-robot-highlight top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-glow"></div>
        </div>
        
        {/* Thinking indicator */}
        {isThinking && (
          <div className="absolute -right-5 -top-5 flex space-x-1">
            <div className="w-3 h-3 bg-robot-highlight rounded-full animate-bounce-gentle"></div>
            <div className="w-3 h-3 bg-robot-highlight rounded-full animate-bounce-gentle" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-robot-highlight rounded-full animate-bounce-gentle" style={{ animationDelay: "0.4s" }}></div>
          </div>
        )}
        
        {/* Status circles */}
        <div className="absolute bottom-4 left-4 flex space-x-2">
          <div className={cn("w-3 h-3 rounded-full", 
            isCelebrating ? "bg-green-300" : 
            isDenied ? "bg-red-300" : 
            "bg-robot-highlight"
          )}></div>
          <div className={cn("w-3 h-3 rounded-full", 
            isCelebrating ? "bg-green-300" : 
            isDenied ? "bg-red-300" : 
            "bg-robot-highlight"
          )}></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-8 h-8 lg:w-10 lg:h-10 rounded-br-3xl border-r-4 border-b-4 border-robot-highlight opacity-50"></div>
        
        {/* Tech circles */}
        <div className="absolute top-1 right-1 w-12 h-12 rounded-full border-2 border-robot-highlight opacity-20 animate-spin-slow"></div>
      </div>
    </div>
  );
};

export default AnimatedRobot;
