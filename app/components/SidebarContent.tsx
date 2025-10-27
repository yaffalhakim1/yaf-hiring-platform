import {
  VStack,
  Box,
  Text,
  Icon,
  Button,
  Heading,
  Separator,
} from '@chakra-ui/react';
import { Briefcase, Users, LogOut } from 'lucide-react';

interface SidebarContentProps {
  user: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  location: any;
  isMobile?: boolean;
}

const SidebarContent = ({
  user,
  onLogout,
  onNavigate,
  location,
  isMobile = false,
}: SidebarContentProps) => {
  const menuItems = [
    {
      label: 'Job Listings',
      icon: Briefcase,
      path: '/admin/jobs',
    },
    {
      label: 'Candidates',
      icon: Users,
      path: '/admin/candidates',
    },
  ];

  return (
    <VStack h='full' align='stretch' gap={0}>
      {/* Logo/Brand */}
      <Box
        p={6}
        borderBottom='1px'
        borderColor='border.emphasized'
        bg='bg.subtle'
      >
        <Heading size='md' color='primary.600'>
          Hiring Portal
        </Heading>
        <Text fontSize='sm' color='fg.muted'>
          Admin Panel
        </Text>
      </Box>

      {/* Navigation */}
      <VStack
        flex={1}
        p={4}
        align='stretch'
        gap={1}
        as='ul'
        role='menubar'
        aria-orientation='vertical'
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Box key={item.path} as='li' role='none'>
              <Button
                onClick={() => onNavigate(item.path)}
                variant={isActive ? 'solid' : 'ghost'}
                colorPalette={isActive ? 'primary' : 'gray'}
                justifyContent='start'
                gap={3}
                w='full'
                minH={isMobile ? '3.5rem' : '3rem'}
                px={4}
                fontSize={isMobile ? 'md' : 'sm'}
                role='menuitem'
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                _hover={{
                  bg: 'primary.200',
                }}
                transition='all 0.2s ease-in-out'
              >
                <Icon as={item.icon} boxSize={isMobile ? 5 : 4} />
                <Text>{item.label}</Text>
              </Button>
            </Box>
          );
        })}
      </VStack>

      {/* User Info & Logout */}
      <Box
        p={4}
        borderTop='1px'
        borderColor='border.emphasized'
        position='sticky'
        bottom={0}
        bg='bg.subtle'
      >
        <VStack align='stretch' gap={3}>
          <Box>
            <Text fontSize='sm' fontWeight='medium'>
              {user?.name || 'Admin'}
            </Text>
            <Text fontSize='xs' color='fg.muted'>
              {user?.email || 'admin@hiring.com'}
            </Text>
          </Box>
          <Separator />
          <Button
            variant='ghost'
            colorPalette='red'
            justifyContent='start'
            gap={3}
            onClick={onLogout}
            w='full'
            minH={isMobile ? '3.5rem' : '3rem'}
            aria-label='Logout from admin panel'
            _hover={{
              bg: isMobile ? 'bg.muted' : 'bg.subtle',
              transform: isMobile ? 'translateX(4px)' : 'translateX(2px)',
            }}
            transition='all 0.2s ease-in-out'
          >
            <Icon as={LogOut} boxSize={isMobile ? 5 : 4} />
            Logout
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
};

export default SidebarContent;
