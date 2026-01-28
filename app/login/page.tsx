
import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
    title: 'Login - Qlarify',
    description: 'Sign in to your Qlarify account to manage your diagrams.',
};

export default function LoginPage() {
    return <LoginForm />;
}
