/**
 * Gesture State Machine for Hand Gesture Detection
 * Manages the 1→2→3 finger sequence detection for photo capture
 */

export interface GestureState {
  currentStep: number; // 0: waiting, 1: detected 1 finger, 2: detected 2 fingers, 3: detected 3 fingers
  lastGestureTime: number;
  lastFingerCount: number;
  isHolding: boolean;
  holdStartTime: number;
  confidence: number;
}

export interface GestureConfig {
  holdDuration: number; // How long to hold gesture (ms)
  timeoutDuration: number; // Reset if no gesture for this long (ms)
  confidenceThreshold: number; // Minimum confidence to consider gesture valid
  requiredHoldStability: number; // How stable the gesture must be during hold
}

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  holdDuration: 1000, // 1 second
  timeoutDuration: 3000, // 3 seconds
  confidenceThreshold: 0.7,
  requiredHoldStability: 0.8,
};

export class GestureDetector {
  private state: GestureState;
  private config: GestureConfig;
  private onGestureDetected?: (step: number) => void;
  private onSequenceCompleted?: () => void;
  private onReset?: () => void;

  constructor(config: Partial<GestureConfig> = {}) {
    this.config = { ...DEFAULT_GESTURE_CONFIG, ...config };
    this.state = this.getInitialState();
  }

  private getInitialState(): GestureState {
    return {
      currentStep: 0,
      lastGestureTime: 0,
      lastFingerCount: 0,
      isHolding: false,
      holdStartTime: 0,
      confidence: 0,
    };
  }

  /**
   * Set callbacks for gesture events
   */
  setCallbacks(callbacks: {
    onGestureDetected?: (step: number) => void;
    onSequenceCompleted?: () => void;
    onReset?: () => void;
  }) {
    this.onGestureDetected = callbacks.onGestureDetected;
    this.onSequenceCompleted = callbacks.onSequenceCompleted;
    this.onReset = callbacks.onReset;
  }

  /**
   * Process new finger count and update state machine
   */
  processFingerCount(fingerCount: number, confidence: number = 1.0): void {
    const now = Date.now();

    // Reset if timeout occurred
    if (now - this.state.lastGestureTime > this.config.timeoutDuration) {
      this.reset();
    }

    // Only process if confidence is high enough
    if (confidence < this.config.confidenceThreshold) {
      return;
    }

    // Check if this is the same gesture as before (for holding detection)
    const isSameGesture = fingerCount === this.state.lastFingerCount;

    if (isSameGesture && fingerCount > 0) {
      // Continue or start holding
      if (!this.state.isHolding) {
        this.state.isHolding = true;
        this.state.holdStartTime = now;
      }

      const holdDuration = now - this.state.holdStartTime;

      // Check if we've held long enough
      if (holdDuration >= this.config.holdDuration) {
        this.processValidGesture(fingerCount, now);
      }
    } else {
      // Gesture changed, reset holding state
      this.state.isHolding = false;

      // Start new gesture detection if it's a valid finger count
      if (this.isValidFingerCount(fingerCount)) {
        this.state.lastFingerCount = fingerCount;
        this.state.lastGestureTime = now;
        this.state.confidence = confidence;
      }
    }
  }

  private processValidGesture(fingerCount: number, timestamp: number): void {
    const expectedFingerCount = this.state.currentStep + 1;

    if (fingerCount === expectedFingerCount) {
      // Correct gesture for current step
      this.state.currentStep++;
      this.state.lastGestureTime = timestamp;
      this.state.isHolding = false;

      // Notify about gesture detection
      this.onGestureDetected?.(this.state.currentStep);

      // Check if sequence is complete
      if (this.state.currentStep === 3) {
        this.onSequenceCompleted?.();
        this.reset();
      }
    } else if (fingerCount === 1 && this.state.currentStep === 0) {
      // Start of sequence
      this.state.currentStep = 1;
      this.state.lastGestureTime = timestamp;
      this.state.isHolding = false;
      this.onGestureDetected?.(1);
    } else {
      // Wrong gesture, reset
      this.reset();
    }
  }

  private isValidFingerCount(fingerCount: number): boolean {
    return fingerCount >= 1 && fingerCount <= 5;
  }

  /**
   * Reset the state machine
   */
  reset(): void {
    const wasActive = this.state.currentStep > 0;
    this.state = this.getInitialState();

    if (wasActive) {
      this.onReset?.();
    }
  }

  /**
   * Get current state
   */
  getState(): GestureState {
    return { ...this.state };
  }

  /**
   * Get current progress for UI display
   */
  getProgress(): {
    currentStep: number;
    totalSteps: number;
    nextGesture: string;
    isHolding: boolean;
    holdProgress: number;
  } {
    const holdProgress = this.state.isHolding
      ? Math.min(
          (Date.now() - this.state.holdStartTime) / this.config.holdDuration,
          1
        )
      : 0;

    const nextGesture = this.getNextGestureText();

    return {
      currentStep: this.state.currentStep,
      totalSteps: 3,
      nextGesture,
      isHolding: this.state.isHolding,
      holdProgress,
    };
  }

  private getNextGestureText(): string {
    switch (this.state.currentStep) {
      case 0:
        return 'Show 1 finger to start';
      case 1:
        return 'Show 2 fingers';
      case 2:
        return 'Show 3 fingers to capture';
      default:
        return 'Sequence complete!';
    }
  }

  /**
   * Check if currently holding a gesture
   */
  isHoldingGesture(): boolean {
    return this.state.isHolding;
  }

  /**
   * Get time remaining for current hold
   */
  getHoldTimeRemaining(): number {
    if (!this.state.isHolding) return 0;

    const elapsed = Date.now() - this.state.holdStartTime;
    return Math.max(0, this.config.holdDuration - elapsed);
  }
}

/**
 * Create a gesture detector instance with default configuration
 */
export function createGestureDetector(
  config?: Partial<GestureConfig>
): GestureDetector {
  return new GestureDetector(config);
}

/**
 * Utility function to format gesture progress for display
 */
export function formatGestureProgress(progress: {
  currentStep: number;
  totalSteps: number;
  nextGesture: string;
  isHolding: boolean;
  holdProgress: number;
}): string {
  const { currentStep, totalSteps, nextGesture, isHolding, holdProgress } =
    progress;

  if (currentStep >= totalSteps) {
    return '✨ Photo captured!';
  }

  if (isHolding) {
    const percentage = Math.round(holdProgress * 100);
    return `${nextGesture} (${percentage}%)`;
  }

  return nextGesture;
}
