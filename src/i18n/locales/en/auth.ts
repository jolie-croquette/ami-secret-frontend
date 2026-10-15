import type { Translation } from '../../types';
import type fr from '../fr/auth';

const auth: Translation<typeof fr> = {
  badge: 'SS',
  badgeTitle: 'Secret Santa badge',
  tagline: 'gift exchanges made easy',
  tabs: { login: 'Log in', signup: 'Sign up' },
  fields: {
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    lastName: 'Last name',
    lastNamePlaceholder: 'Your last name',
    campName: 'Nickname (optional)',
    campNamePlaceholder: 'e.g. Beaver',
    campNameHint: 'If you add one, it’s what other players will see in your games.',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    confirmPassword: 'Confirm password',
  },
  submit: {
    login: 'Log in',
    signup: 'Create my account',
    loggingIn: 'Logging in…',
    signingUp: 'Creating your account…',
  },
  forgotLink: 'Forgot your password?',
  toasts: {
    noContext: 'Internal error: sign-in is unavailable right now.',
    required: 'Please enter your email and password.',
    invalidEmail: 'Please enter a valid email address.',
    firstNameRequired: 'First name is required.',
    lastNameRequired: 'Last name is required.',
    passwordTooShort: 'Your password is too short (6 characters minimum).',
    created: 'Your account is ready!',
    loggedIn: 'Welcome back!',
    emailTaken: 'This email is already in use.',
    badCredentials: 'Incorrect email or password.',
    authError: 'We couldn’t sign you in. Please try again.',
  },
  forgot: {
    title: 'Forgot your password?',
    intro: 'Enter your email and we’ll send you a link to choose a new password.',
    submit: 'Send the link',
    sentTitle: 'Check your inbox',
    sentBody:
      'If an account exists for this address, we’ve just sent you a reset link. It expires in 1 hour.',
    backToLogin: 'Back to log in',
  },
  reset: {
    title: 'Choose a new password',
    intro: 'Pick a new password for your account.',
    submit: 'Reset password',
    mismatch: 'Passwords don’t match.',
    success: 'Your password has been reset. You can now log in.',
    invalidLink: 'This link is invalid or has expired. Please request a new one.',
    missingTitle: 'Incomplete link',
    missingBody: 'This reset link isn’t valid. Please request a new one.',
    requestLink: 'Request a new link',
  },
};

export default auth;
