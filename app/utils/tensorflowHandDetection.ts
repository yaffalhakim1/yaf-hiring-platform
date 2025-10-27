/**
 * TensorFlow Hand Detection Utilities
 *
 * This module provides hand detection and finger counting functionality
 * using TensorFlow.js Hand Pose Detection models as an alternative to MediaPipe.
 */

import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';

// Types for TensorFlow hand detection
export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface Hand {
  landmarks: HandLandmark[];
  boundingBox: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    width: number;
    height: number;
  };
  score: number;
  handedness: string;
}

export interface FingerCount {
  count: number;
  confidence: number;
  fingers: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

export class TensorFlowHandDetector {
  private detector: handPoseDetection.HandDetector | null = null;
  private isInitialized = false;
  private modelType = handPoseDetection.SupportedModels.MediaPipeHands;

  /**
   * Initialize the hand detector
   */
  async initialize(): Promise<void> {
    try {
      console.log('🤖 Initializing TensorFlow Hand Detector...');

      // Configure the detector
      const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
        {
          runtime: 'mediapipe' as const,
          modelType: 'lite' as const,
          maxHands: 1, // We only need to detect one hand for our use case
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        };

      // Create the detector
      this.detector = await handPoseDetection.createDetector(
        this.modelType,
        detectorConfig
      );

      this.isInitialized = true;
      console.log('✅ TensorFlow Hand Detector initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize TensorFlow Hand Detector:', error);
      throw new Error(`Failed to initialize hand detector: ${error}`);
    }
  }

  /**
   * Check if detector is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.detector !== null;
  }

  /**
   * Detect hands in an image or video frame
   */
  async detectHands(
    imageData: HTMLVideoElement | HTMLImageElement | ImageData
  ): Promise<Hand[]> {
    if (!this.isReady() || !this.detector) {
      throw new Error(
        'Hand detector not initialized. Call initialize() first.'
      );
    }

    try {
      const predictions = await this.detector.estimateHands(imageData);

      // Convert TensorFlow predictions to our Hand interface
      const hands: Hand[] = predictions.map((prediction: any) => ({
        landmarks: prediction.landmarks.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
          visibility: landmark.visibility || 1.0,
        })),
        boundingBox: {
          xMin: prediction.boundingBox?.xMin || 0,
          yMin: prediction.boundingBox?.yMin || 0,
          xMax: prediction.boundingBox?.xMax || 0,
          yMax: prediction.boundingBox?.yMax || 0,
          width: prediction.boundingBox?.width || 0,
          height: prediction.boundingBox?.height || 0,
        },
        score: prediction.score || 0,
        handedness: prediction.handedness?.[0]?.displayName || 'unknown',
      }));

      return hands;
    } catch (error) {
      console.error('❌ Error detecting hands:', error);
      return [];
    }
  }

  /**
   * Count extended fingers from hand landmarks
   */
  countFingers(hand: Hand): FingerCount {
    const landmarks = hand.landmarks;

    if (!landmarks || landmarks.length < 21) {
      return {
        count: 0,
        confidence: 0,
        fingers: {
          thumb: false,
          index: false,
          middle: false,
          ring: false,
          pinky: false,
        },
      };
    }

    // Landmark indices for MediaPipe hand model
    const WRIST = 0;
    const THUMB_TIP = 4;
    const THUMB_IP = 3;
    const THUMB_MCP = 2;
    const INDEX_TIP = 8;
    const INDEX_PIP = 6;
    const INDEX_MCP = 5;
    const MIDDLE_TIP = 12;
    const MIDDLE_PIP = 10;
    const MIDDLE_MCP = 9;
    const RING_TIP = 16;
    const RING_PIP = 14;
    const RING_MCP = 13;
    const PINKY_TIP = 20;
    const PINKY_PIP = 18;
    const PINKY_MCP = 17;

    const fingers = {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    };

    let count = 0;
    let totalConfidence = 0;

    // Thumb detection (special case - horizontal comparison)
    const thumbIsExtended = this.isThumbExtended(
      landmarks,
      WRIST,
      THUMB_TIP,
      THUMB_IP,
      THUMB_MCP
    );
    if (thumbIsExtended) {
      fingers.thumb = true;
      count++;
    }
    totalConfidence += thumbIsExtended ? 0.9 : 0.1;

    // Other four fingers (vertical comparison)
    const fingerPairs = [
      {
        tip: INDEX_TIP,
        pip: INDEX_PIP,
        mcp: INDEX_MCP,
        name: 'index' as keyof typeof fingers,
      },
      {
        tip: MIDDLE_TIP,
        pip: MIDDLE_PIP,
        mcp: MIDDLE_MCP,
        name: 'middle' as keyof typeof fingers,
      },
      {
        tip: RING_TIP,
        pip: RING_PIP,
        mcp: RING_MCP,
        name: 'ring' as keyof typeof fingers,
      },
      {
        tip: PINKY_TIP,
        pip: PINKY_PIP,
        mcp: PINKY_MCP,
        name: 'pinky' as keyof typeof fingers,
      },
    ];

    fingerPairs.forEach((finger) => {
      const isExtended = this.isFingerExtended(
        landmarks,
        finger.tip,
        finger.pip,
        finger.mcp
      );
      if (isExtended) {
        fingers[finger.name] = true;
        count++;
      }
      totalConfidence += isExtended ? 0.9 : 0.1;
    });

    return {
      count,
      confidence: totalConfidence / 5, // Average confidence across all fingers
      fingers,
    };
  }

  /**
   * Check if thumb is extended (horizontal comparison)
   */
  private isThumbExtended(
    landmarks: HandLandmark[],
    wrist: number,
    tip: number,
    ip: number,
    mcp: number
  ): boolean {
    try {
      const wristPoint = landmarks[wrist];
      const tipPoint = landmarks[tip];
      const ipPoint = landmarks[ip];
      const mcpPoint = landmarks[mcp];

      if (!wristPoint || !tipPoint || !ipPoint || !mcpPoint) return false;

      // For thumb, we check if it's extended horizontally away from the hand
      const thumbHorizontal = tipPoint.x - mcpPoint.x;
      const handCenterX = (wristPoint.x + ipPoint.x) / 2;

      // Thumb is extended if it's to the right of the hand center (for right hand)
      // or to the left (for left hand). We'll use a simple approach.
      return thumbHorizontal > 0.05; // Threshold for thumb extension
    } catch (error) {
      console.error('Error checking thumb extension:', error);
      return false;
    }
  }

  /**
   * Check if a finger is extended (vertical comparison)
   */
  private isFingerExtended(
    landmarks: HandLandmark[],
    tip: number,
    pip: number,
    mcp: number
  ): boolean {
    try {
      const tipPoint = landmarks[tip];
      const pipPoint = landmarks[pip];
      const mcpPoint = landmarks[mcp];

      if (!tipPoint || !pipPoint || !mcpPoint) return false;

      // Check if tip is higher (smaller y) than pip, and pip is higher than mcp
      const tipHigherThanPip = tipPoint.y < pipPoint.y - 0.02; // Small threshold
      const pipHigherThanMcp = pipPoint.y < mcpPoint.y - 0.02;

      return tipHigherThanPip && pipHigherThanMcp;
    } catch (error) {
      console.error('Error checking finger extension:', error);
      return false;
    }
  }

  /**
   * Get finger count with confidence threshold
   */
  async getFingerCount(
    imageData: HTMLVideoElement | HTMLImageElement | ImageData,
    minConfidence: number = 0.7
  ): Promise<FingerCount> {
    const hands = await this.detectHands(imageData);

    if (hands.length === 0) {
      return {
        count: 0,
        confidence: 0,
        fingers: {
          thumb: false,
          index: false,
          middle: false,
          ring: false,
          pinky: false,
        },
      };
    }

    // Use the first (most confident) hand
    const bestHand = hands.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    const fingerCount = this.countFingers(bestHand);

    // Apply confidence threshold
    if (fingerCount.confidence < minConfidence) {
      return {
        count: 0,
        confidence: fingerCount.confidence,
        fingers: {
          thumb: false,
          index: false,
          middle: false,
          ring: false,
          pinky: false,
        },
      };
    }

    return fingerCount;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.detector = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let handDetectorInstance: TensorFlowHandDetector | null = null;

/**
 * Get or create hand detector instance
 */
export function getHandDetector(): TensorFlowHandDetector {
  if (!handDetectorInstance) {
    handDetectorInstance = new TensorFlowHandDetector();
  }
  return handDetectorInstance;
}

/**
 * Initialize hand detector (convenience function)
 */
export async function initializeHandDetector(): Promise<TensorFlowHandDetector> {
  const detector = getHandDetector();
  await detector.initialize();
  return detector;
}
