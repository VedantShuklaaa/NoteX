import Signup from '@/app/ui/signup/signup';
import GradientBackground from '@/components/ui/background';
import React from 'react';


export default function SignupPage() {
  return (
    <div className='h-[100vh] w-full flex items-center justify-center bg-[var(--background)]'>
      <GradientBackground/>
      <GradientBackground/>
      <Signup/>
    </div>
  );
}
