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
import { updatePasswordSchema, updatePasswordType } from "@/schema/users"
import { useMutation } from "@tanstack/react-query"
import { AuthAPI } from "@/lib/api/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const form = useForm<updatePasswordType>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            password: "",
            token: "",
        },
    })

    const { isPending, mutate } = useMutation<unknown, Error, updatePasswordType>({
        mutationFn: AuthAPI.updatePassword,
        onSuccess: () => {
            toast.success("Password updated successfully!")
            router.push("/login")
        },
        onError: (error) => {
            toast.error(error.message || "An error occurred")
        }
    })

    function onSubmit(values: updatePasswordType) {
        mutate(values)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
                    <CardDescription>Enter the token from your email and create a new password</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="token"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reset Token</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter the token from your email" {...field} />
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
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter your new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Loading..." : "Reset Password"}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <a href="/login" className="text-primary hover:underline">
                            Back to login
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}