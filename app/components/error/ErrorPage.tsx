import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Code,
  Container,
} from '@chakra-ui/react';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showStackTrace?: boolean;
  stackTrace?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export default function ErrorPage({
  statusCode = 500,
  title = 'Terjadi Kesalahan',
  message = 'Terjadi kesalahan saat memuat halaman ini. Silahkan coba lagi dalam beberapa saat.',
  showStackTrace = false,
  stackTrace,
  onRetry,
  onGoHome,
}: ErrorPageProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Container>
      <Box
        as='section'
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        p={8}
      >
        <VStack gap={6} textAlign='center'>
          <Heading size='4xl' color='fg.error' fontWeight='bold'>
            {statusCode}
          </Heading>

          <Heading size='xl' color='fg.default'>
            {title}
          </Heading>

          <VStack gap={3}>
            <Button colorScheme='blue' onClick={handleRetry}>
              Coba Lagi
            </Button>

            <Button variant='outline' onClick={handleGoHome}>
              Kembali ke Beranda
            </Button>
          </VStack>

          <Text color='fg.muted' fontSize='lg'>
            {message}
          </Text>

          {showStackTrace && stackTrace && (
            <Box
              w='full'
              bg='bg.subtle'
              border='1px solid'
              borderColor='border.emphasized'
              borderRadius='md'
              p={4}
              textAlign='left'
            >
              <details>
                <Text
                  as='summary'
                  fontSize='sm'
                  fontWeight='medium'
                  color='fg.muted'
                  cursor='pointer'
                  mb={2}
                >
                  Error Stack Trace
                </Text>
                <Code
                  fontSize='xs'
                  color='red'
                  bg='bg.subtle'
                  p={2}
                  borderRadius='sm'
                  display='block'
                  whiteSpace='pre-wrap'
                  wordBreak='break-all'
                >
                  {stackTrace}
                </Code>
              </details>
            </Box>
          )}
        </VStack>
      </Box>
    </Container>
  );
}
