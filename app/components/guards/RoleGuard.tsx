import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserRole } from '../../contexts/AuthContext';
import { Box, Spinner, Text, Button } from '@chakra-ui/react';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  roles,
  redirectTo = '/unauthorized',
  fallback,
}: RoleGuardProps) {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minH='100vh'
        bg='bg.subtle'
      >
        <Spinner size='xl' color='blue.500' mb={4} />
        <Text color='fg.muted'>Memuat...</Text>
      </Box>
    );
  }

  // Check if user has required role
  const hasRequiredRole = roles.some((role) => hasRole(role));

  if (!hasRequiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

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
        <Text fontSize='2xl' fontWeight='bold' color='fg.error' mb={4}>
          Akses Ditolak
        </Text>
        <Text color='fg.muted' textAlign='center' mb={6}>
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        </Text>
        <Button
          colorScheme='blue'
          onClick={() => {
            if (user) {
              // If user is logged in but wrong role, redirect to their dashboard
              const dashboardPath = user.role === 'admin' ? '/admin' : '/jobs';
              window.location.href = dashboardPath;
            } else {
              // If not logged in, redirect to login
              window.location.href = '/login';
            }
          }}
        >
          {user ? 'Kembali ke Dashboard' : 'Login'}
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
