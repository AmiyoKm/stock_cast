"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { cn } from "@/lib/utils"
import React from "react"
import { loginSchema, loginSchemaType } from "@/schema/users"
import { useMutation } from "@tanstack/react-query"
import { AuthAPI } from "@/lib/api/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { EnvelopeLoginUser } from "@/types/api"


export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const form = useForm<loginSchemaType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { isPending, mutate } = useMutation<EnvelopeLoginUser, Error, loginSchemaType>({
        mutationFn: AuthAPI.login,
        onSuccess: (data) => {
            toast.success("Login successful!")
            localStorage.setItem("token", data.authentication_token)
            router.push("/")
        },
        onError: (error) => {
            toast.error(error.message || "An error occurred")
        }
    })

    function onSubmit(values: loginSchemaType) {
        mutate(values)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center">
                                            <FormLabel>Password</FormLabel>
                                            <a href="/forgot-password" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                                                Forgot your password?
                                            </a>
                                        </div>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Loading..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <a href="/signup" className="underline underline-offset-4">
                            Sign up
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
