import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useController, type Control } from 'react-hook-form';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Alert,
  Spinner,
  Image,
  Progress,
} from '@chakra-ui/react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Upload,
  Check,
  Hand as HandIcon,
} from 'lucide-react';
import {
  initializeHandDetector,
  getHandDetector,
  type FingerCount,
  type Hand,
} from '../../utils/tensorflowHandDetection';

interface TensorFlowGestureCaptureProps {
  name: string;
  control: Control<any>;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

// Gesture states for our 1→2→3 finger sequence
enum GestureState {
  IDLE = 'idle',
  WAITING_FOR_ONE = 'waiting_for_one',
  ONE_DETECTED = 'one_detected',
  WAITING_FOR_TWO = 'waiting_for_two',
  TWO_DETECTED = 'two_detected',
  WAITING_FOR_THREE = 'waiting_for_three',
  THREE_DETECTED = 'three_detected',
  CAPTURED = 'captured',
  ERROR = 'error',
}

export default function TensorFlowGestureCapture({
  name,
  control,
  label,
  disabled = false,
  required = false,
}: TensorFlowGestureCaptureProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  // UI State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    field.value || null
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>(
    GestureState.IDLE
  );
  const [currentFingerCount, setCurrentFingerCount] = useState<number>(0);
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [gestureProgress, setGestureProgress] = useState<number>(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const handDetectorRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (handDetectorRef.current) {
        handDetectorRef.current.dispose();
      }
    };
  }, [stream]);

  // Initialize TensorFlow hand detector
  const initializeDetector = useCallback(async () => {
    if (handDetectorRef.current?.isReady()) {
      return;
    }

    try {
      setIsInitializing(true);
      setErrorMessage('');
      console.log('🤖 Initializing TensorFlow Hand Detector...');

      const detector = await initializeHandDetector();
      handDetectorRef.current = detector;

      console.log('✅ TensorFlow Hand Detector ready');
    } catch (error: any) {
      console.error('❌ Failed to initialize hand detector:', error);
      setErrorMessage(`Failed to initialize hand detection: ${error.message}`);
      setGestureState(GestureState.ERROR);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    console.log('🎬 Starting TensorFlow gesture camera...');

    // Wait a moment for refs to be available and retry if needed
    let retryCount = 0;
    const maxRetries = 5;

    while (retryCount < maxRetries) {
      if (videoRef.current && canvasRef.current) {
        console.log('✅ Refs are available');
        break;
      }

      console.log(
        `⏳ Waiting for refs... attempt ${retryCount + 1}/${maxRetries}`
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      retryCount++;
    }

    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas ref not found after retries');
      setErrorMessage(
        'Camera elements not ready. Please refresh and try again.'
      );
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      // Initialize hand detector first
      await initializeDetector();

      console.log('📷 Requesting camera access...');

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      console.log('✅ Camera access granted');

      // Set stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
        setGestureState(GestureState.WAITING_FOR_ONE);
        console.log('✅ Camera started successfully');
      }
    } catch (error: any) {
      console.error('❌ Failed to access camera:', error);

      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        setErrorMessage(
          'Camera access denied. Please allow camera permissions and try again.'
        );
      } else if (error.name === 'NotFoundError') {
        setErrorMessage(
          'No camera found. Please connect a camera and try again.'
        );
      } else if (error.name === 'NotReadableError') {
        setErrorMessage('Camera is already in use by another application.');
      } else {
        setErrorMessage(
          `Failed to access camera: ${error.message || 'Unknown error'}`
        );
      }

      setIsCameraActive(false);
      setGestureState(GestureState.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [initializeDetector]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setGestureState(GestureState.IDLE);
    setCurrentFingerCount(0);
    setDetectionConfidence(0);
    setGestureProgress(0);
  }, [stream]);

  // Process video frame for hand detection
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !handDetectorRef.current?.isReady()) {
      return;
    }

    try {
      const fingerCount: FingerCount =
        await handDetectorRef.current.getFingerCount(
          videoRef.current,
          0.6 // Minimum confidence threshold
        );

      setCurrentFingerCount(fingerCount.count);
      setDetectionConfidence(fingerCount.confidence);

      // Handle gesture state machine
      setGestureState((prevState) => {
        switch (prevState) {
          case GestureState.WAITING_FOR_ONE:
            if (fingerCount.count === 1 && fingerCount.confidence > 0.7) {
              console.log('✅ 1 finger detected');
              setGestureProgress(33);
              return GestureState.ONE_DETECTED;
            }
            return prevState;

          case GestureState.ONE_DETECTED:
            if (fingerCount.count === 0) {
              console.log('⏳ Waiting for 2 fingers...');
              return GestureState.WAITING_FOR_TWO;
            }
            return prevState;

          case GestureState.WAITING_FOR_TWO:
            if (fingerCount.count === 2 && fingerCount.confidence > 0.7) {
              console.log('✅ 2 fingers detected');
              setGestureProgress(66);
              return GestureState.TWO_DETECTED;
            }
            return prevState;

          case GestureState.TWO_DETECTED:
            if (fingerCount.count === 0) {
              console.log('⏳ Waiting for 3 fingers...');
              return GestureState.WAITING_FOR_THREE;
            }
            return prevState;

          case GestureState.WAITING_FOR_THREE:
            if (fingerCount.count === 3 && fingerCount.confidence > 0.7) {
              console.log('✅ 3 fingers detected - Capturing photo!');
              setGestureProgress(100);
              // Auto-capture photo
              setTimeout(() => capturePhoto(), 500);
              return GestureState.THREE_DETECTED;
            }
            return prevState;

          default:
            return prevState;
        }
      });
    } catch (error) {
      console.error('❌ Error processing frame:', error);
    }

    // Continue processing
    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isCameraActive]);

  // Start frame processing when camera is active
  useEffect(() => {
    if (isCameraActive && handDetectorRef.current?.isReady()) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isCameraActive, processFrame]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    field.onChange(imageData);
    setGestureState(GestureState.CAPTURED);
    setGestureProgress(100);

    // Stop camera after capture
    stopCamera();

    console.log('✅ Photo captured successfully');
  }, [field, stopCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    field.onChange(null);
    setGestureState(GestureState.IDLE);
    setGestureProgress(0);
  }, [field]);

  // Handle file upload fallback
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        field.onChange(imageData);
        setGestureState(GestureState.CAPTURED);
      };
      reader.readAsDataURL(file);
    },
    [field]
  );

  // Get gesture instruction text
  const getGestureInstruction = () => {
    switch (gestureState) {
      case GestureState.WAITING_FOR_ONE:
        return 'Show 1 finger ✊👆';
      case GestureState.ONE_DETECTED:
        return 'Good! Now hide your hand ✋';
      case GestureState.WAITING_FOR_TWO:
        return 'Now show 2 fingers ✌️';
      case GestureState.TWO_DETECTED:
        return 'Great! Now hide your hand ✋';
      case GestureState.WAITING_FOR_THREE:
        return 'Finally, show 3 fingers 🤟';
      case GestureState.THREE_DETECTED:
        return 'Perfect! Photo captured! 📸';
      default:
        return 'Follow the gesture sequence';
    }
  };

  return (
    <Box>
      <Text fontWeight='medium' mb={2}>
        {label}
        {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
      </Text>

      <VStack gap={4} align='stretch'>
        {capturedImage ? (
          // Show captured image
          <VStack gap={3}>
            <Box
              position='relative'
              borderRadius='md'
              overflow='hidden'
              border='2px solid'
              borderColor='green.500'
            >
              <Image
                src={capturedImage}
                alt='Captured photo'
                width='100%'
                height='auto'
                maxH='300px'
                objectFit='cover'
              />
              <Box
                position='absolute'
                top={2}
                right={2}
                bg='green.500'
                color='white'
                borderRadius='full'
                p={1}
              >
                <Check size={20} />
              </Box>
            </Box>

            <HStack gap={2}>
              <Button variant='outline' size='sm' onClick={retakePhoto}>
                <RefreshCw size={16} style={{ marginRight: '8px' }} />
                Retake Photo
              </Button>
              <Button variant='outline' size='sm' as='label'>
                <Upload size={16} style={{ marginRight: '8px' }} />
                Upload File
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </Button>
            </HStack>
          </VStack>
        ) : (
          // Show camera interface or upload option
          <VStack gap={3}>
            {isCameraActive ? (
              <VStack gap={3}>
                <Box
                  position='relative'
                  borderRadius='md'
                  overflow='hidden'
                  border='2px solid'
                  borderColor={
                    gestureState === GestureState.ERROR ? 'red.500' : 'blue.500'
                  }
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '300px',
                      display: 'block',
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* Gesture detection overlay */}
                  <Box
                    position='absolute'
                    top={2}
                    left={2}
                    bg='rgba(0,0,0,0.7)'
                    color='white'
                    p={2}
                    borderRadius='md'
                  >
                    <VStack gap={1} align='start'>
                      <HStack gap={2}>
                        <HandIcon size={16} />
                        <Text fontSize='sm' fontWeight='bold'>
                          {currentFingerCount} fingers
                        </Text>
                      </HStack>
                      <Text fontSize='xs'>
                        Confidence: {Math.round(detectionConfidence * 100)}%
                      </Text>
                    </VStack>
                  </Box>

                  {/* Progress indicator */}
                  {gestureState !== GestureState.IDLE &&
                    gestureState !== GestureState.ERROR && (
                      <Box
                        position='absolute'
                        bottom={0}
                        left={0}
                        right={0}
                        bg='rgba(0,0,0,0.7)'
                        p={2}
                      >
                        <VStack gap={1}>
                          <Text fontSize='xs' color='white' textAlign='center'>
                            {getGestureInstruction()}
                          </Text>
                          <Progress.Root
                            value={gestureProgress}
                            size='sm'
                            colorPalette='green'
                          >
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </VStack>
                      </Box>
                    )}
                </Box>

                <HStack gap={2}>
                  <Button variant='outline' size='sm' onClick={stopCamera}>
                    <CameraOff size={16} style={{ marginRight: '8px' }} />
                    Stop Camera
                  </Button>
                  <Button variant='outline' size='sm' as='label'>
                    <Upload size={16} style={{ marginRight: '8px' }} />
                    Upload File
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack gap={3}>
                <Box
                  bg='blue.50'
                  border='2px dashed'
                  borderColor='blue.300'
                  borderRadius='md'
                  p={8}
                  textAlign='center'
                >
                  <Camera size={48} color='blue' style={{ margin: '0 auto' }} />
                  <Text mt={2} color='blue.600'>
                    TensorFlow Hand Detection Ready
                  </Text>
                </Box>

                <HStack gap={2}>
                  <Button
                    variant='solid'
                    size='sm'
                    onClick={startCamera}
                    disabled={isLoading || isInitializing}
                  >
                    {isLoading || isInitializing ? (
                      <Spinner size='sm' style={{ marginRight: '8px' }} />
                    ) : (
                      <Camera size={16} style={{ marginRight: '8px' }} />
                    )}
                    {isInitializing
                      ? 'Initializing...'
                      : isLoading
                        ? 'Starting...'
                        : 'Start Gesture Camera'}
                  </Button>
                  <Button variant='outline' size='sm' as='label'>
                    <Upload size={16} style={{ marginRight: '8px' }} />
                    Upload File
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        )}

        {/* Error display */}
        {errorMessage && (
          <Alert.Root status='error' variant='subtle'>
            <Alert.Indicator />
            <Box>
              <Alert.Title>Camera Error</Alert.Title>
              <Alert.Description>{errorMessage}</Alert.Description>
            </Box>
          </Alert.Root>
        )}

        {/* Form validation error */}
        {error && (
          <Text color='red.500' fontSize='sm'>
            {error.message}
          </Text>
        )}

        {/* Instructions */}
        {!capturedImage && (
          <Box bg='green.50' p={3} borderRadius='md'>
            <Text fontSize='sm' color='green.800'>
              <strong>Gesture Instructions:</strong>
              <br />
              1. Click "Start Gesture Camera"
              <br />
              2. Follow the sequence: 1 finger → 2 fingers → 3 fingers
              <br />
              3. Photo will be captured automatically after 3 fingers
              <br />
              <br />
              <strong>Sequence:</strong> ✊👆 → ✋ → ✌️ → ✋ → 🤟 → 📸
              <br />
              <br />
              Or use the "Upload File" button to select an image.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
