/**
 * Finger Detection Utilities for MediaPipe Hands
 * Provides hand landmark analysis and finger counting functionality
 */

// MediaPipe hand landmark indices
export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

/**
 * Count extended fingers from hand landmarks
 * @param landmarks - Array of 21 hand landmarks from MediaPipe
 * @param handedness - 'Left' or 'Right' hand detection
 * @returns Number of extended fingers (0-5)
 */
export function countFingers(landmarks: any[], handedness?: string): number {
  if (!landmarks || landmarks.length !== 21) return 0;

  let count = 0;

  // Thumb detection - different logic for left vs right hand
  const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
  const thumbIP = landmarks[HAND_LANDMARKS.THUMB_IP];
  const thumbMCP = landmarks[HAND_LANDMARKS.THUMB_MCP];

  // For right hand, thumb tip is to the right of thumb IP when extended
  // For left hand, thumb tip is to the left of thumb IP when extended
  const isRightHand = handedness === 'Right';
  const thumbExtended = isRightHand
    ? thumbTip.x > thumbIP.x
    : thumbTip.x < thumbIP.x;

  if (thumbExtended) count++;

  // Index finger - tip is above PIP joint when extended
  const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP];
  const indexPIP = landmarks[HAND_LANDMARKS.INDEX_FINGER_PIP];
  if (indexTip.y < indexPIP.y) count++;

  // Middle finger - tip is above PIP joint when extended
  const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP];
  const middlePIP = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_PIP];
  if (middleTip.y < middlePIP.y) count++;

  // Ring finger - tip is above PIP joint when extended
  const ringTip = landmarks[HAND_LANDMARKS.RING_FINGER_TIP];
  const ringPIP = landmarks[HAND_LANDMARKS.RING_FINGER_PIP];
  if (ringTip.y < ringPIP.y) count++;

  // Pinky - tip is above PIP joint when extended
  const pinkyTip = landmarks[HAND_LANDMARKS.PINKY_TIP];
  const pinkyPIP = landmarks[HAND_LANDMARKS.PINKY_PIP];
  if (pinkyTip.y < pinkyPIP.y) count++;

  return count;
}

/**
 * Get the most prominent hand from multiple hand detections
 * @param results - MediaPipe hands results
 * @returns The most prominent hand landmarks and handedness
 */
export function getProminentHand(results: any) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return null;
  }

  if (results.multiHandLandmarks.length === 1) {
    return {
      landmarks: results.multiHandLandmarks[0],
      handedness: results.multiHandedness?.[0]?.label || 'Unknown',
    };
  }

  // If multiple hands, choose the one with largest bounding box
  let mostProminentHand = 0;
  let maxArea = 0;

  results.multiHandLandmarks.forEach((landmarks: any[], index: number) => {
    const minX = Math.min(...landmarks.map((l) => l.x));
    const maxX = Math.max(...landmarks.map((l) => l.x));
    const minY = Math.min(...landmarks.map((l) => l.y));
    const maxY = Math.max(...landmarks.map((l) => l.y));
    const area = (maxX - minX) * (maxY - minY);

    if (area > maxArea) {
      maxArea = area;
      mostProminentHand = index;
    }
  });

  return {
    landmarks: results.multiHandLandmarks[mostProminentHand],
    handedness:
      results.multiHandedness?.[mostProminentHand]?.label || 'Unknown',
  };
}

/**
 * Check if hand is properly visible and not too close to edges
 * @param landmarks - Hand landmarks
 * @param imageWidth - Image width
 * @param imageHeight - Image height
 * @returns Boolean indicating if hand is properly positioned
 */
export function isHandWellPositioned(
  landmarks: any[],
  imageWidth: number,
  imageHeight: number
): boolean {
  if (!landmarks || landmarks.length !== 21) return false;

  // Check if all landmarks are within reasonable bounds
  const margin = 0.1; // 10% margin from edges

  for (const landmark of landmarks) {
    if (
      landmark.x < margin ||
      landmark.x > 1 - margin ||
      landmark.y < margin ||
      landmark.y > 1 - margin
    ) {
      return false;
    }
  }

  // Check if hand is not too small (indicating it's too far)
  const minX = Math.min(...landmarks.map((l) => l.x));
  const maxX = Math.max(...landmarks.map((l) => l.x));
  const minY = Math.min(...landmarks.map((l) => l.y));
  const maxY = Math.max(...landmarks.map((l) => l.y));

  const width = maxX - minX;
  const height = maxY - minY;
  const minSize = 0.15; // Minimum 15% of image dimensions

  if (width < minSize || height < minSize) {
    return false;
  }

  return true;
}

/**
 * Calculate hand confidence based on landmark visibility
 * @param landmarks - Hand landmarks
 * @returns Confidence score between 0 and 1
 */
export function calculateHandConfidence(landmarks: any[]): number {
  if (!landmarks || landmarks.length !== 21) return 0;

  // Check visibility scores if available
  let totalVisibility = 0;
  let visibleLandmarks = 0;

  landmarks.forEach((landmark) => {
    if (landmark.visibility !== undefined) {
      totalVisibility += landmark.visibility;
      visibleLandmarks++;
    }
  });

  if (visibleLandmarks > 0) {
    return totalVisibility / visibleLandmarks;
  }

  // Fallback: assume good confidence if we have all landmarks
  return 0.8;
}
