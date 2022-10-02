import React, { useRef } from "react";
import "./App.css";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/pose";

import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    // Load posenet
    const runPoseEstimation = async () => {
        // const net = await posenet.load({
        //   inputResolution: { width: 640, height: 480 },
        //   scale: 0.5,
        // });
        const modelString = "BlazePose";
        const model = posedetection.SupportedModels.BlazePose;

        let net;
        if (modelString === "BlazePose") {
            const detectorConfig = {
                runtime: "tfjs", // don't work 'mediepipe'
                modelType: "full",
                solutionPath: "base/node_modules/@mediapipe/pose",
            };
            net = await posedetection.createDetector(model, detectorConfig);
        } else {
            net = await posedetection.createDetector(model);
        }
        setInterval(() => {
            detect(net);
        }, 100);
    };

    const detect = async (net) => {
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            // Get Video Properties
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            // Set vidoe width
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            // Make Detections
            const pose = await net.estimatePoses(video);
            console.log(pose);

            drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
        }
    };

    const drawCanvas = (pose, video, videoWidth, vidoeHeight, canvas) => {
        const ctx = canvas.current.getContext("2d");
        canvas.current.width = videoWidth;
        canvas.current.height = vidoeHeight;

        drawKeypoints(pose[0]["keypoints"], 0.5, ctx);
        // drawSkeleton(pose[0]["keypoints"], 0.5, ctx);s
    };
    runPoseEstimation();

    return (
        <div className="App">
            <header className="App-header">
                <Webcam
                    ref={webcamRef}
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zindex: 9,
                        width: 640,
                        height: 480,
                    }}
                />

                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zindex: 9,
                        width: 640,
                        height: 480,
                    }}
                />
            </header>
        </div>
    );
}

export default App;
