import { createToaster } from '@chakra-ui/react';

// Create a toaster instance
export const toaster = createToaster({
  placement: 'bottom-start',
  duration: 5000,
  max: 3,
});

// Toast utility functions for common use cases
export const toast = {
  success: (title: string, description?: string) => {
    return toaster.success({
      title,
      description,
    });
  },

  error: (title: string, description?: string) => {
    return toaster.error({
      title,
      description,
    });
  },

  info: (title: string, description?: string) => {
    return toaster.info({
      title,
      description,
    });
  },

  warning: (title: string, description?: string) => {
    return toaster.warning({
      title,
      description,
    });
  },

  loading: (title: string, description?: string) => {
    return toaster.loading({
      title,
      description,
    });
  },
};

// Specific toast messages for the application
export const appToasts = {
  // Application form toasts
  applicationSuccess: (jobTitle: string) =>
    toast.success(
      'Application Submitted Successfully!',
      `Your application for the ${jobTitle} position has been successfully submitted. We will contact you soon.`
    ),

  applicationError: () =>
    toast.error(
      'Failed to Submit Application',
      'An error occurred while submitting your application. Please try again.'
    ),

  // Login toasts
  loginSuccess: () =>
    toast.success('Login Successful!', 'Welcome back to the hiring platform.'),

  loginError: (message?: string) =>
    toast.error(
      'Login Failed',
      message || 'Invalid email or password. Please try again.'
    ),

  // Job creation toasts
  jobCreateSuccess: () =>
    toast.success(
      'Job Created Successfully!',
      'The new job opening has been successfully created and published.'
    ),

  jobCreateError: () =>
    toast.error(
      'Failed to Create Job',
      'An error occurred while creating the job posting. Please check the data and try again.'
    ),

  // Generic success/error toasts
  saveSuccess: (entity: string) =>
    toast.success(
      'Data Saved Successfully!',
      `${entity} has been successfully saved.`
    ),

  saveError: (entity: string) =>
    toast.error(
      'Failed to Save Data',
      `An error occurred while saving ${entity}. Please try again.`
    ),

  deleteSuccess: (entity: string) =>
    toast.success(
      'Data Deleted Successfully!',
      `${entity} has been successfully deleted.`
    ),

  deleteError: (entity: string) =>
    toast.error(
      'Failed to Delete Data',
      `An error occurred while deleting ${entity}. Please try again.`
    ),
};
