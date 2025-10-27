import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  VStack,
  HStack,
  Portal,
  Dialog,
  CloseButton,
  Button,
  Text,
  Heading,
  Separator,
} from '@chakra-ui/react';
import { RHFormInput, RHFormTextarea, RHFormSelect } from '../rhforms';
import { appToasts } from '../../lib/toast';

import {
  createJobSchema,
  type CreateJobFormData,
  type ProfileField,
  defaultProfileFields,
  jobStatusOptions,
  jobTypeOptions,
} from '../../validation/job.schema';
import type { Job } from '../../types/jobs';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  onSubmit?: (data: CreateJobFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  mode?: 'create' | 'edit';
  job?: Job;
}

export default function CreateJobDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  mode = 'create',
  job,
}: CreateJobDialogProps) {
  const {
    control,
    handleSubmit: handleRHFSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      numberOfCandidates: '',
      description: '',
      status: 'draft' as const,
      type: 'full_time' as const,
      salaryMin: '',
      salaryMax: '',
      profileFields: defaultProfileFields,
    },
  });

  // Reset form when dialog opens/closes or job data changes
  React.useEffect(() => {
    if (open) {
      if (mode === 'edit' && job) {
        // Pre-fill form with job data for edit mode
        reset({
          title: job.title || '',
          numberOfCandidates: job.number_of_candidates?.toString() || '0',
          description: job.description || '',
          status: job.status || 'draft',
          salaryMin: job.salary_min?.toString() || '',
          salaryMax: job.salary_max?.toString() || '',
          type: job.type || 'full_time',
          profileFields: job.profile_config
            ? Object.entries(job.profile_config).map(([key, config]) => ({
                id: key,
                label: config.label,
                state: config.state,
              }))
            : defaultProfileFields,
        });
      } else {
        // Reset to defaults for create mode
        reset({
          title: '',
          numberOfCandidates: '',
          description: '',
          status: 'draft',
          salaryMin: '',
          salaryMax: '',
          profileFields: defaultProfileFields,
        });
      }
    }
  }, [open, mode, job, reset]);

  const profileFields = watch('profileFields');

  const handleProfileFieldChange = (
    fieldId: string,
    state: ProfileField['state']
  ) => {
    const currentFields = watch('profileFields');
    setValue(
      'profileFields',
      currentFields.map((field) =>
        field.id === fieldId ? { ...field, state } : field
      )
    );
  };

  const handleSubmit = async (data: CreateJobFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      // Show success toast based on mode
      if (mode === 'edit') {
        appToasts.saveSuccess('Job');
      } else {
        appToasts.jobCreateSuccess();
      }
      onOpenChange({ open: false });
      reset();
    } catch (error) {
      console.error(`Failed to ${mode} job:`, error);
      // Show error toast based on mode
      if (mode === 'edit') {
        appToasts.saveError('Job');
      } else {
        appToasts.jobCreateError();
      }
    }
  };

  const handleDialogClose = () => {
    reset();
    onOpenChange({ open: false });
  };

  const getStateColor = (state: ProfileField['state']) => {
    switch (state) {
      case 'mandatory':
        return 'red';
      case 'optional':
        return 'blue';
      case 'off':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleDialogClose}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW='2xl' maxH='90vh' overflowY='auto'>
            <Dialog.Header>
              <Dialog.Title>
                {mode === 'edit' ? 'Edit Job' : 'Create Job'}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={6} align='start'>
                {/* Basic Job Information */}
                <Box w='full'>
                  <Heading size='md' mb={4}>
                    Basic Job Information
                  </Heading>
                  <VStack gap={4}>
                    <RHFormInput
                      name='title'
                      control={control}
                      label='Position'
                      placeholder='Enter job title'
                      required
                    />

                    <RHFormSelect
                      name='status'
                      control={control}
                      label='Job Status'
                      placeholder='Select status'
                      options={jobStatusOptions}
                    />
                    <RHFormSelect
                      name='type'
                      control={control}
                      label='Job Type'
                      placeholder='Select type'
                      options={jobTypeOptions}
                    />

                    <RHFormTextarea
                      name='description'
                      control={control}
                      label='Description'
                      placeholder='Enter job description'
                      rows={4}
                      required
                    />

                    <RHFormInput
                      name='numberOfCandidates'
                      control={control}
                      label='Number Of Candidates'
                      placeholder='Enter number of candidates'
                      required
                    />

                    <HStack gap={4} w='full'>
                      <RHFormInput
                        name='salaryMin'
                        control={control}
                        label='Minimum Salary'
                        placeholder='Rp 0'
                        type='number'
                        required
                      />
                      <RHFormInput
                        name='salaryMax'
                        control={control}
                        label='Maximum Salary'
                        placeholder='Rp 0'
                        type='number'
                        required
                      />
                    </HStack>
                  </VStack>
                </Box>

                <Separator />

                {/* Profile Configuration */}
                <Box w='full'>
                  <Heading size='md' mb={4}>
                    Candidate Profile Configuration
                  </Heading>
                  <Text color='fg.muted' mb={4} fontSize='sm'>
                    Set the visibility and requirement status of each profile
                    field for candidates applying to this job.
                  </Text>

                  <VStack gap={3} align='start'>
                    {profileFields.map((field) => (
                      <Box w='full' key={field.id}>
                        <HStack justify='space-between' align='center'>
                          <Text fontWeight='medium'>{field.label}</Text>

                          <HStack gap={2}>
                            <Button
                              size='xs'
                              variant={
                                field.state === 'mandatory'
                                  ? 'solid'
                                  : 'outline'
                              }
                              colorPalette={getStateColor(field.state)}
                              onClick={() =>
                                handleProfileFieldChange(field.id, 'mandatory')
                              }
                            >
                              Required
                            </Button>
                            <Button
                              size='xs'
                              variant={
                                field.state === 'optional' ? 'solid' : 'outline'
                              }
                              colorPalette={getStateColor(field.state)}
                              onClick={() =>
                                handleProfileFieldChange(field.id, 'optional')
                              }
                            >
                              Optional
                            </Button>
                            <Button
                              size='xs'
                              variant={
                                field.state === 'off' ? 'solid' : 'outline'
                              }
                              colorPalette={getStateColor(field.state)}
                              onClick={() =>
                                handleProfileFieldChange(field.id, 'off')
                              }
                            >
                              Hidden
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              {mode === 'edit' && onDelete && (
                <Button
                  colorPalette='red'
                  variant='outline'
                  onClick={async () => {
                    try {
                      await onDelete();
                      onOpenChange({ open: false });
                    } catch (error) {
                      console.error('Failed to delete job:', error);
                    }
                  }}
                >
                  Delete Job
                </Button>
              )}
              <Dialog.ActionTrigger asChild>
                <Button variant='outline'>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleRHFSubmit(handleSubmit)}
                loading={isSubmitting}
              >
                {mode === 'edit' ? 'Update Job' : 'Create Job'}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size='sm' />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
