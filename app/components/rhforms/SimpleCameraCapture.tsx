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
} from '@chakra-ui/react';
import { Camera, CameraOff, RefreshCw, Upload, Check } from 'lucide-react';

interface SimpleCameraCaptureProps {
  name: string;
  control: Control<any>;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

export default function SimpleCameraCapture({
  name,
  control,
  label,
  disabled = false,
  required = false,
}: SimpleCameraCaptureProps) {
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
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start camera
  const startCamera = useCallback(async () => {
    console.log('🎬 Starting simple camera...');

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
      console.log('Video ref:', videoRef.current);
      console.log('Canvas ref:', canvasRef.current);
      setErrorMessage(
        'Camera elements not ready. Please refresh and try again.'
      );
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }, [stream]);

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

    // Stop camera after capture
    stopCamera();

    console.log('✅ Photo captured successfully');
  }, [field, stopCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    field.onChange(null);
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

                  {/* Capture button overlay */}
                  <Box
                    position='absolute'
                    bottom={4}
                    left='50%'
                    transform='translateX(-50%)'
                  >
                    <Button
                      colorPalette='red'
                      size='lg'
                      onClick={capturePhoto}
                      borderRadius='full'
                      width='60px'
                      height='60px'
                    >
                      <Camera size={24} />
                    </Button>
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
              <strong>Photo Instructions:</strong>
              <br />
              • Click "Start Camera" to begin
              <br />
              • Position yourself in the camera frame
              <br />
              • Click the red camera button to capture photo
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
