import React from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

export default function NotFoundPage() {
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
        <Heading size='4xl' color='fg.muted' fontWeight='bold'>
          404
        </Heading>

        <Heading size='xl' color='fg.default'>
          Halaman Tidak Ditemukan
        </Heading>

        <Text color='fg.muted' fontSize='lg'>
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </Text>

        <VStack gap={3}>
          <Button
            colorScheme='blue'
            onClick={() => (window.location.href = '/')}
          >
            Kembali ke Beranda
          </Button>

          <Button variant='outline' onClick={() => window.history.back()}>
            Kembali ke Halaman Sebelumnya
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
