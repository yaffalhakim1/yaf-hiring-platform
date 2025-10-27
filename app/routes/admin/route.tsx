import { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  HStack,
  Text,
  Icon,
  Button,
  Heading,
  Container,
} from '@chakra-ui/react';
import { LogOut, Settings } from 'lucide-react';
import { AuthGuard } from '~/components/guards/AuthGuard';
import { RoleGuard } from '~/components/guards/RoleGuard';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <AuthGuard>
      <RoleGuard roles={['admin']}>
        <Box minH='100vh' bg='bg.canvas'>
          {/* Top Navigation Bar */}
          <Box
            px={6}
            py={4}
            borderBottom='1px'
            borderColor='border.emphasized'
            bg='bg.subtle'
          >
            <HStack justify='space-between' align='center'>
              <Heading size='lg'>Hiring Portal Admin</Heading>
              <HStack gap={4}>
                <Text fontSize='sm' color='fg.muted'>
                  Welcome, {user?.name || 'Admin'}!
                </Text>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleNavigation('/admin/candidates')}
                  gap={2}
                >
                  <Icon as={Settings} boxSize={4} />
                  Candidates
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleLogout}
                  gap={2}
                >
                  <Icon as={LogOut} boxSize={4} />
                  Logout
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Main Content Area */}

          <Outlet />
        </Box>
      </RoleGuard>
    </AuthGuard>
  );
}
