import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useController, type Control } from 'react-hook-form';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  ProgressRoot,
  ProgressTrack,
  ProgressRange,
  Alert,
  Spinner,
  Image,
} from '@chakra-ui/react';
import { Camera, CameraOff, RefreshCw, Upload, Check } from 'lucide-react';
import handsPkg from '@mediapipe/hands';
import cameraPkg from '@mediapipe/camera_utils';

const { Hands } = handsPkg;
const { Camera: MediaPipeCameraUtils } = cameraPkg;
import {
  countFingers,
  getProminentHand,
  isHandWellPositioned,
  calculateHandConfidence,
} from '../../utils/fingerDetection';
import {
  createGestureDetector,
  formatGestureProgress,
} from '../../utils/gestureStateMachine';

interface RHFormPhotoCaptureProps {
  name: string;
  control: Control<any>;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

export default function RHFormPhotoCapture({
  name,
  control,
  label,
  disabled = false,
  required = false,
}: RHFormPhotoCaptureProps) {
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
  const [capturedImage, setCapturedImage] = useState<string | null>(
    field.value || null
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [fingerCount, setFingerCount] = useState(0);
  const [gestureProgress, setGestureProgress] = useState('');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const gestureDetectorRef = useRef(createGestureDetector());

  // Initialize gesture detector callbacks
  useEffect(() => {
    gestureDetectorRef.current.setCallbacks({
      onGestureDetected: (step) => {
        setGestureProgress(`Step ${step}/3 completed!`);
      },
      onSequenceCompleted: () => {
        capturePhoto();
      },
      onReset: () => {
        setGestureProgress('Sequence reset. Try again!');
      },
    });
  }, []);

  // Initialize MediaPipe Hands
  const initializeHands = useCallback(async () => {
    console.log('🎬 Initializing camera...');

    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas ref not found');
      setErrorMessage('Video or canvas element not found');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      console.log('📦 Loading MediaPipe Hands...');

      // Check if MediaPipe is available
      if (!Hands) {
        console.error('❌ MediaPipe Hands not loaded');
        setErrorMessage(
          'MediaPipe Hands failed to load. Please refresh the page.'
        );
        return;
      }

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          console.log(`📁 Loading MediaPipe file: ${file}`);
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      console.log('⚙️ Setting up MediaPipe options...');

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        console.log(
          '👋 Hand detection results:',
          results.multiHandLandmarks?.length || 0,
          'hands'
        );
        onHandResults(results);
      });

      handsRef.current = hands;
      console.log('✅ MediaPipe Hands initialized');

      // Check if Camera Utils is available
      if (!MediaPipeCameraUtils) {
        console.error('❌ MediaPipe Camera Utils not loaded');
        setErrorMessage(
          'MediaPipe Camera Utils failed to load. Please refresh the page.'
        );
        return;
      }

      // Initialize camera
      console.log('📷 Initializing camera...');

      const camera = new MediaPipeCameraUtils(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      cameraRef.current = camera;

      console.log('🎥 Starting camera stream...');
      await camera.start();

      console.log('✅ Camera started successfully');
      setIsCameraActive(true);
    } catch (error: any) {
      console.error('❌ Failed to initialize camera:', error);
      setErrorMessage(
        `Failed to access camera: ${error?.message || 'Unknown error'}. Please check permissions and try again.`
      );
      setIsCameraActive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process hand detection results
  const onHandResults = useCallback((results: any) => {
    if (!canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    // Clear and draw video frame
    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    let currentFingerCount = 0;
    let handDetected = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const prominentHand = getProminentHand(results);

      if (prominentHand) {
        const { landmarks, handedness } = prominentHand;

        // Check if hand is well positioned
        const isWellPositioned = isHandWellPositioned(
          landmarks,
          canvasRef.current.width,
          canvasRef.current.height
        );

        if (isWellPositioned) {
          // Count fingers
          currentFingerCount = countFingers(landmarks, handedness);
          const confidence = calculateHandConfidence(landmarks);

          // Process gesture
          gestureDetectorRef.current.processFingerCount(
            currentFingerCount,
            confidence
          );

          // Draw simple hand landmarks (circles at key points)
          canvasCtx.fillStyle = '#FF0000';
          landmarks.forEach((landmark: any) => {
            const x = landmark.x * canvasRef.current!.width;
            const y = landmark.y * canvasRef.current!.height;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
            canvasCtx.fill();
          });

          handDetected = true;
        }
      }
    }

    // Update finger count display
    setFingerCount(currentFingerCount);

    // Update gesture progress display
    const progress = gestureDetectorRef.current.getProgress();
    setGestureProgress(formatGestureProgress(progress));

    canvasCtx.restore();
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    await initializeHands();
  }, [initializeHands]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setIsCameraActive(false);
    setFingerCount(0);
    setGestureProgress('');
    gestureDetectorRef.current.reset();
  }, []);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Capture current frame
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    field.onChange(imageData);

    // Stop camera after capture
    stopCamera();

    // Show success message
    setGestureProgress('✨ Photo captured successfully!');
  }, [field, stopCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    field.onChange(null);
    setGestureProgress('');
    gestureDetectorRef.current.reset();
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
      };
      reader.readAsDataURL(file);
    },
    [field]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
                  borderColor='gray.300'
                >
                  <video
                    ref={videoRef}
                    style={{ display: 'none' }}
                    autoPlay
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '300px',
                    }}
                  />

                  {/* Overlay UI */}
                  <Box
                    position='absolute'
                    top={2}
                    left={2}
                    bg='blackAlpha.700'
                    color='white'
                    px={3}
                    py={2}
                    borderRadius='md'
                  >
                    <Text fontSize='sm' fontWeight='medium'>
                      Fingers: {fingerCount}
                    </Text>
                  </Box>

                  <Box
                    position='absolute'
                    bottom={2}
                    left={2}
                    right={2}
                    bg='blackAlpha.700'
                    color='white'
                    px={3}
                    py={2}
                    borderRadius='md'
                  >
                    <Text fontSize='sm' textAlign='center'>
                      {gestureProgress}
                    </Text>
                    {gestureDetectorRef.current.isHoldingGesture() && (
                      <ProgressRoot
                        value={
                          gestureDetectorRef.current.getProgress()
                            .holdProgress * 100
                        }
                        size='xs'
                        mt={2}
                      >
                        <ProgressTrack>
                          <ProgressRange colorPalette='green' />
                        </ProgressTrack>
                      </ProgressRoot>
                    )}
                  </Box>
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
                  bg='gray.100'
                  border='2px dashed'
                  borderColor='gray.300'
                  borderRadius='md'
                  p={8}
                  textAlign='center'
                >
                  <Camera size={48} color='gray' style={{ margin: '0 auto' }} />
                  <Text mt={2} color='gray.600'>
                    Camera not active
                  </Text>
                </Box>

                <HStack gap={2}>
                  <Button
                    variant='solid'
                    size='sm'
                    onClick={startCamera}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner size='sm' style={{ marginRight: '8px' }} />
                    ) : (
                      <Camera size={16} style={{ marginRight: '8px' }} />
                    )}
                    {isLoading ? 'Starting...' : 'Start Camera'}
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
          <Box bg='blue.50' p={3} borderRadius='md'>
            <Text fontSize='sm' color='blue.800'>
              <strong>Gesture Instructions:</strong>
              <br />
              1. Show 1 finger and hold for 1 second
              <br />
              2. Show 2 fingers and hold for 1 second
              <br />
              3. Show 3 fingers and hold for 1 second to capture photo
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
