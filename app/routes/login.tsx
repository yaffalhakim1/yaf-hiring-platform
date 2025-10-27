import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  Alert,
  Container,
  HStack,
  Grid,
  Icon,
} from '@chakra-ui/react';
import { Briefcase, FileText, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../validation/login.schema';
import { RHFormInput } from '../components/rhforms';
import { extractErrorMessage } from '../lib/error-handling';
import { appToasts } from '../lib/toast';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');

    try {
      const user = await login(data);

      // Show success toast
      appToasts.loginSuccess();

      // Role-based redirect
      if (user.role === 'admin') {
        navigate('/admin/jobs', { replace: true });
      } else {
        navigate('/jobs', { replace: true });
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      appToasts.loginError(errorMessage);
    }
  };

  return (
    <Box
      minH='100vh'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <Container clearTop mx='auto' py={12} px={4}>
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={12}
          alignItems='center'
        >
          {/* Left Side - Welcome Text */}
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Heading mb={6}>
              Mulai perjalanan karirmu hari ini dan raih kesuksesan bersama
              kami.
            </Heading>
            <VStack align={{ base: 'center', lg: 'start' }} gap={4}>
              <HStack gap={3}>
                <Icon as={Briefcase} boxSize={5} color='primary.500' />
                <Text fontSize='md'>Akses ke ribuan lowongan kerja</Text>
              </HStack>
              <HStack gap={3}>
                <Icon as={FileText} boxSize={5} color='primary.500' />
                <Text fontSize='md'>Proses aplikasi yang mudah</Text>
              </HStack>
              <HStack gap={3}>
                <Icon as={Building} boxSize={5} color='primary.500' />
                <Text fontSize='md'>Terhubung langsung dengan perusahaan</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Right Side - Login Form */}
          <Box maxW='md' mx={{ base: 'auto', lg: '0' }} w='full'>
            <VStack gap={6} align={{ base: 'center', lg: 'start' }}>
              <Box textAlign={{ base: 'center', lg: 'left' }} mb={4}>
                <Heading size='lg' mb={2}>
                  Selamat Datang Kembali
                </Heading>
                <Text color='fg.muted'>
                  Login untuk mengakses sistem hiring
                </Text>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                <VStack gap={4} align={{ base: 'center', lg: 'start' }}>
                  <RHFormInput
                    name='email'
                    label='Email'
                    type='email'
                    placeholder='Masukkan email'
                    control={control}
                  />

                  <RHFormInput
                    name='password'
                    label='Password'
                    type='password'
                    placeholder='Masukkan password'
                    control={control}
                  />

                  {error && (
                    <Alert.Root status='error' w='full'>
                      <Alert.Indicator />
                      <Alert.Title>{error}</Alert.Title>
                    </Alert.Root>
                  )}

                  <Button
                    type='submit'
                    colorPalette='blue'
                    width='full'
                    loading={isSubmitting}
                    loadingText='Login...'
                  >
                    Login
                  </Button>
                </VStack>
              </form>

              <Box textAlign={{ base: 'center', lg: 'left' }}>
                <Text
                  fontSize='sm'
                  color='fg.muted'
                  textAlign={{ base: 'center', lg: 'left' }}
                >
                  Demo Credentials:
                </Text>
                <VStack gap={1} mt={2} align={{ base: 'center', lg: 'start' }}>
                  <Text fontSize='xs' color='fg.subtle'>
                    Admin: admin@hiring.com / password123
                  </Text>
                  <Text fontSize='xs' color='fg.subtle'>
                    Applicant: applicant@hiring.com / pasword123
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
