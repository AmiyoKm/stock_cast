"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card"
import { cn } from "@/lib/utils"
import React from "react"
import { registerSchema, registerSchemaType } from "@/schema/users"
import { EnvelopeRegisterUser } from "@/types/api"
import { AuthAPI } from "@/lib/api/auth"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const form = useForm<registerSchemaType>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })
    const { isPending, mutate } = useMutation<EnvelopeRegisterUser, Error, registerSchemaType>({
        mutationFn: AuthAPI.register,
        onSuccess: (_) => {
            toast.success("Account Created", {
                description: "Please check your email to activate your account.",
            });
            form.reset()
            router.push("/login")
        },
        onError: (error) => {
            toast.error(error.message || "An error occurred")
        }
    })

    function onSubmit(values: registerSchemaType) {
        mutate(values)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center space-y-2">
                    <CardDescription>Create your account to start tracking and predicting stock prices</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="trader123" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="trader@example.com" {...field} />
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Create a strong password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Loading..." : "Submit"}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <a href="/login" className="text-primary hover:underline">
                            Sign in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
