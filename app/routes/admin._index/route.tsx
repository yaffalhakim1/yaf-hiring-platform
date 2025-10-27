import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Heading,
  Text,
  Grid,
  Stat,
  StatLabel,
  StatValueText,
  HStack,
  Icon,
  Button,
  VStack,
} from '@chakra-ui/react';
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Lowongan',
      value: '12',
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Total Pelamar',
      value: '248',
      icon: Users,
      color: 'green',
    },
    {
      label: 'Aplikasi Baru',
      value: '23',
      icon: FileText,
      color: 'orange',
    },
    {
      label: 'Tingkat Konversi',
      value: '18.5%',
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const quickActions = [
    {
      title: 'Buat Lowongan Baru',
      description: 'Tambahkan lowongan kerja baru',
      icon: Briefcase,
      action: () => navigate('/admin/jobs/create'),
      color: 'primary',
    },
    {
      title: 'Kelola Pelamar',
      description: 'Lihat dan kelola aplikasi pelamar',
      icon: Users,
      action: () => navigate('/admin/candidates'),
      color: 'secondary',
    },
  ];

  return (
    <Box p={8}>
      <VStack align='start' gap={8}>
        {/* Header */}
        <Box>
          <Heading size='2xl' mb={2}>
            Dashboard Admin
          </Heading>
          <Text color='fg.muted'>
            Selamat datang kembali, {user?.name || 'Admin'}!
          </Text>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: '2fr 2fr' }} gap={6} w='full'>
          {stats.map((stat, index) => (
            <Box key={index} p={6} borderWidth='1px' borderRadius='lg'>
              <HStack gap={4}>
                <Box
                  p={3}
                  borderRadius='lg'
                  bg={`${stat.color}.50`}
                  color={`${stat.color}.600`}
                >
                  <Icon as={stat.icon} boxSize={6} />
                </Box>
                <Stat.Root>
                  <StatLabel color='fg.muted'>{stat.label}</StatLabel>
                  <StatValueText fontSize='2xl' fontWeight='bold'>
                    {stat.value}
                  </StatValueText>
                </Stat.Root>
              </HStack>
            </Box>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box w='full'>
          <Heading size='lg' mb={4}>
            Aksi Cepat
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            {quickActions.map((action, index) => (
              <Box
                key={index}
                p={6}
                borderWidth='1px'
                borderRadius='lg'
                bg='bg.subtle'
              >
                <VStack align='start' gap={4}>
                  <HStack gap={3}>
                    <Box
                      p={2}
                      borderRadius='md'
                      bg={`${action.color}.50`}
                      color={`${action.color}.600`}
                    >
                      <Icon as={action.icon} boxSize={5} />
                    </Box>
                    <Box>
                      <Heading size='md' mb={1}>
                        {action.title}
                      </Heading>
                      <Text color='fg.muted' fontSize='sm'>
                        {action.description}
                      </Text>
                    </Box>
                  </HStack>
                  <Button onClick={action.action} w='full'>
                    Mulai
                  </Button>
                </VStack>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Recent Activity Placeholder */}
        <Box p={6} borderWidth='1px' borderRadius='lg' w='full'>
          <Heading size='lg' mb={4}>
            Aktivitas Terkini
          </Heading>
          <Text color='fg.muted'>
            Belum ada aktivitas terkini. Mulai dengan membuat lowongan baru atau
            melihat aplikasi pelamar.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
