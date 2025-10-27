import {
  HStack,
  Box,
  Avatar,
  Menu,
  Portal,
  Text,
  Button,
  Separator,
  Container,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {};

  const handleSettings = () => {};

  return (
    <Container clearVertical>
      <Box
        bg='primary'
        borderBottom='1px solid'
        borderColor='border.subtle'
        py={3}
        px={4}
        position='sticky'
        top={0}
        zIndex={1000}
      >
        <HStack justify='space-between' align='center'>
          {/* Logo/Brand Area */}
          <Box>
            <Text fontSize='xl' fontWeight='bold' color='fg.default'>
              YAF Hiring Platform
            </Text>
          </Box>

          {/* Profile Area */}
          <HStack gap={4}>
            {isAuthenticated && user ? (
              <Menu.Root positioning={{ placement: 'bottom-end' }}>
                <Menu.Trigger asChild>
                  <Button
                    variant='ghost'
                    p={2}
                    rounded='full'
                    _hover={{ bg: 'bg.subtle' }}
                  >
                    <Avatar.Root size='sm'>
                      <Avatar.Fallback name={user.name} />
                    </Avatar.Root>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content minW='200px'>
                      <Box
                        p={3}
                        borderBottom='1px solid'
                        borderColor='border.subtle'
                      >
                        <Text fontWeight='medium' fontSize='sm'>
                          {user.name}
                        </Text>
                        <Text color='fg.muted' fontSize='xs'>
                          {user.email}
                        </Text>
                        <Text color='fg.muted' fontSize='xs' mt={1}>
                          Role: {user.role}
                        </Text>
                      </Box>

                      <Menu.Item value='profile' onClick={handleProfile}>
                        Profile
                      </Menu.Item>

                      <Menu.Item value='settings' onClick={handleSettings}>
                        Settings
                      </Menu.Item>

                      <Separator />

                      <Menu.Item
                        value='logout'
                        onClick={handleLogout}
                        color='fg.error'
                        _hover={{ bg: 'bg.error', color: 'fg.error' }}
                      >
                        Logout
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>
    </Container>
  );
}
