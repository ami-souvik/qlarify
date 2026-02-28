
import { Metadata } from 'next';
import SignupForm from '@/components/SignupForm';

export const metadata: Metadata = {
    title: 'Sign Up - Qlarify',
    description: 'Create your Qlarify account to start building AI-powered architecture diagrams.',
};

export default function SignupPage() {
    return <SignupForm />;
}
