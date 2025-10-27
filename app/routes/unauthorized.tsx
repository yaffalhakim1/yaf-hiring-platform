import React from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

export default function UnauthorizedPage() {
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      minH='100vh'
      bg='bg.subtle'
      p={8}
    >
      <VStack gap={6} maxW='md' textAlign='center'>
        <Heading size='2xl' color='fg.error'>
          Akses Ditolak
        </Heading>

        <Text color='fg.muted' fontSize='lg'>
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        </Text>

        <Text color='fg.subtle'>
          Silakan login dengan akun yang memiliki izin yang sesuai atau hubungi
          administrator.
        </Text>

        <VStack gap={3}>
          <Button
            colorScheme='blue'
            onClick={() => (window.location.href = '/login')}
          >
            Login
          </Button>

          <Button variant='outline' onClick={() => window.history.back()}>
            Kembali
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
