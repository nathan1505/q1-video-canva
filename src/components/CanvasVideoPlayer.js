import React, { useEffect, useState, useRef } from "react";

const CanvasVideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const audioRef = useRef(null); // Ref for the background music
  const localCurrentTimeRef = useRef(0); // Ref to keep track of local current time

  const scenes = [
    {
      index: 0,
      sentence: "This is a simple Javascript test",
      textPosition: "middle-center",
      textAnimation: "typing",
      media: "https://miro.medium.com/max/1024/1*OK8xc3Ic6EGYg2k6BeGabg.jpeg",
      duration: 3,
    },
    {
      index: 1,
      sentence: "Here comes the video!",
      textPosition: "top-right",
      textAnimation: "blink",
      media: "https://media.gettyimages.com/id/1069900546/zh/%E5%BD%B1%E7%89%87/%E7%A9%BF%E8%91%97%E4%BC%91%E9%96%92%E6%9C%8D%E8%A3%9D%E7%9A%84%E6%BC%82%E4%BA%AE%E7%9A%84%E5%B9%B4%E8%BC%95%E5%A5%B3%E5%AD%90%E6%AD%A3%E5%9C%A8%E5%B7%A5%E4%BD%9C%E5%AE%A4%E4%BD%9C%E7%95%AB-%E7%84%B6%E5%BE%8C%E7%9C%8B%E8%91%97%E5%9C%96%E7%89%87-%E8%A9%95%E5%83%B9%E8%87%AA%E5%B7%B1%E7%9A%84%E4%BD%9C%E5%93%81-%E5%BE%AE%E7%AC%91%E8%91%97%E6%AC%A3%E8%B3%9E%E7%BE%8E%E9%BA%97%E7%9A%84%E5%BD%A2%E8%B1%A1.mp4?s=mp4-640x640-gi&k=20&c=GVKwizwhw7iAN4eZ7G4kvuw2A2QS0OynbK47LgLQHq8=", // Example video
      duration: 5,
    },
  ];

  const image = new Image();
  const video = document.createElement("video");

  useEffect(() => {
    const canvas = document.getElementById("videoCanvas");
    const ctx = canvas.getContext("2d");

    image.src = scenes[0].media;
    video.src = scenes[1].media;
    video.muted = true; // Ensure autoplay works in most browsers

    let animationFrameId;
    let lastTimestamp = 0;

    const drawText = (ctx, sentence, position, animation) => {
      ctx.font = "30px Arial"; // Decide font style
      ctx.fillStyle = "white";
      ctx.textAlign = "center";

      let x = canvas.width / 2;
      let y = canvas.height / 2;

      if (position === "top-right") { // Detect text position
        ctx.textAlign = "right";
        x = canvas.width - 20;
        y = 50;
      } else if (position === "middle-center") {
        ctx.textAlign = "center";
        x = canvas.width / 2;
        y = canvas.height / 2;
      }

      if (animation === "typing") { // Detect text animation type
        const typingProgress = localCurrentTimeRef.current * 10; // Speed of typing effect
        const visibleText = sentence.slice(0, Math.floor(typingProgress));
        ctx.fillText(visibleText, x, y);
      } else if (animation === "blink") {
        const blinkState = Math.floor(localCurrentTimeRef.current * 2) % 2 === 0;
        if (blinkState) {
          ctx.fillText(sentence, x, y);
        }
      } else {
        ctx.fillText(sentence, x, y);
      }
    };

    const drawFrame = (timestamp) => {
      if (!isPlaying) return;

      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      localCurrentTimeRef.current += deltaTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentSceneIndex === 0) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        drawText(
          ctx,
          scenes[0].sentence,
          scenes[0].textPosition,
          scenes[0].textAnimation
        );

        if (localCurrentTimeRef.current >= scenes[0].duration) {
          setCurrentSceneIndex(1);
          localCurrentTimeRef.current = 0;
          handleVideoPlayback();
        }
      } else if (currentSceneIndex === 1) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawText(
          ctx,
          scenes[1].sentence,
          scenes[1].textPosition,
          scenes[1].textAnimation
        );

        if (localCurrentTimeRef.current >= scenes[1].duration) {
          setIsPlaying(false);
          video.pause();
          audioRef.current.pause(); // Stop the background music
          return;
        }
      }

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    const handleVideoPlayback = () => {
      video.currentTime = localCurrentTimeRef.current; // Resume from the last time
      video.play().catch((error) => console.error("Video play failed", error));
    };

    image.onload = () => {
      lastTimestamp = performance.now();
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    video.onloadeddata = () => {
      console.log("Video is ready");
      if(!isPlaying){
        return;
      }
      video.currentTime = 3;
      video.play();
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentSceneIndex]);

  const handleCanvasClick = () => {
    setIsPlaying((prev) => {
      if (prev) {
        video.pause();
        audioRef.current.pause(); // Pause the background music
      } else {
        if (currentSceneIndex === 1) {
          video.play();
        }
        audioRef.current.play(); // Play the background music
      }
      return !prev;
    });
  };

  return (
    <div>
      <canvas
        id="videoCanvas"
        width="1280"
        height="720"
        style={{ width: "1280px", height: "720px", backgroundColor: "#000" }}
        onClick={handleCanvasClick}
      ></canvas>
      <audio
        ref={audioRef}
        src="https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3"
        loop // Ensure the music loops
      />
    </div>
  );
};

export default CanvasVideoPlayer;
