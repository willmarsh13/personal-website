import React, { useEffect, useRef } from "react";

const Starfield: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Stars
        const stars = Array.from({ length: 300 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.2,
            opacity: Math.random(),
            delta: Math.random() * 0.02 + 0.005,
        }));

        // Rocket setup
        const rocketImg = new Image();
        rocketImg.src = process.env.PUBLIC_URL + "/assets/rocket.svg";

        type Rocket = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            active: boolean;
        };

        let rocket: Rocket | null = null;
        let lastRocketTime = 0;

        function launchRocket() {
            if (!canvas) return;
            const size = 30;
            const speed = 1.5 + Math.random();
            const angle = Math.random() * Math.PI * 2;

            const x = canvas.width / 2 + Math.cos(angle + Math.PI) * (canvas.width / 2 + 100);
            const y = canvas.height / 2 + Math.sin(angle + Math.PI) * (canvas.height / 2 + 100);

            rocket = {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                active: true,
            };
        }

        function drawScene() {
            if (!ctx) return;
            if (!canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach((star) => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
                ctx.fill();

                star.opacity += star.delta;
                if (star.opacity <= 0 || star.opacity >= 1) star.delta *= -1;
            });

            const now = Date.now();
            if (!rocket && now - lastRocketTime > 10000) { // 1 rocket every 10-ish seconds
                launchRocket();
                lastRocketTime = now;
            }

            if (rocket && rocket.active && rocketImg.complete && rocketImg.naturalWidth > 0) {
                rocket.x += rocket.vx;
                rocket.y += rocket.vy;

                const angle = Math.atan2(rocket.vy, rocket.vx); // direction of motion
                ctx.save();
                ctx.translate(rocket.x, rocket.y);
                ctx.rotate(angle + Math.PI / 2); // add 180° flip
                ctx.drawImage(
                    rocketImg,
                    -rocket.size / 2,
                    -rocket.size / 2,
                    rocket.size,
                    rocket.size
                );
                ctx.restore();


                // Remove if offscreen
                if (
                    rocket.x < -rocket.size ||
                    rocket.x > canvas.width + rocket.size ||
                    rocket.y < -rocket.size ||
                    rocket.y > canvas.height + rocket.size
                ) {
                    rocket.active = false;
                    rocket = null;
                }
            }

            requestAnimationFrame(drawScene);
        }

        drawScene();

        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: -1,
            }}
        />
    );
};

export default Starfield;
