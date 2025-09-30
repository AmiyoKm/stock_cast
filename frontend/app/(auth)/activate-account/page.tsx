'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { AuthAPI } from '@/lib/api/auth';
import { activateUserType } from '@/schema/users';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Suspense } from 'react';

function ActivateAccount() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const { mutate, isPending, isSuccess, isError, error } = useMutation<
        void,
        Error,
        activateUserType
    >({
        mutationFn: AuthAPI.activateUser,
    });

    const handleActivation = () => {
        if (token) {
            mutate({ token });
        }
    }

    if (!token) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
                <Card className='w-full max-w-md mx-4'>
                    <CardHeader>
                        <CardTitle className='text-2xl font-bold text-red-500'>
                            Activation Token Not Found
                        </CardTitle>
                        <CardDescription>
                            It seems you don&apos;t have a valid activation token.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className='mb-4'>
                            Please check the link you received in your email or try signing up
                            again.
                        </p>
                    </CardContent>
                    <CardFooter className='flex justify-center space-x-4'>
                        <Link href='/signup'>
                            <Button>Sign Up</Button>
                        </Link>
                        <Link href='/login'>
                            <Button>Login</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <Card className='w-full max-w-md mx-4'>
                <CardHeader>
                    <CardTitle className='text-2xl font-bold text-center'>
                        Activate Your Account
                    </CardTitle>
                    <CardDescription className='text-center'>
                        Click the button below to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSuccess && (
                        <Alert variant='default'>
                            <Terminal className='h-4 w-4' />
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>
                                Account activated successfully!
                            </AlertDescription>
                        </Alert>
                    )}
                    {isError && (
                        <Alert variant='destructive'>
                            <Terminal className='h-4 w-4' />
                            <AlertTitle>Error!</AlertTitle>
                            <AlertDescription>
                                {error?.message || 'Failed to activate account.'}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleActivation}
                        disabled={isPending || !token}
                        className='w-full'
                    >
                        {isPending ? 'Activating...' : 'Activate Account'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ActivateAccountPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActivateAccount />
        </Suspense>
    );
}