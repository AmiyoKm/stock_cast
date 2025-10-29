"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import { forgotPasswordSchema, forgotPasswordType } from "@/schema/users";
import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/lib/api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const form = useForm<forgotPasswordType>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const { isPending, mutate } = useMutation<void, Error, forgotPasswordType>({
		mutationFn: AuthAPI.forgotPassword,
		onSuccess: () => {
			toast.success("Password reset link sent to your email!");
			router.push("/login");
		},
		onError: (error) => {
			toast.error(error.message || "Your account is not activated");
		},
	});

	function onSubmit(values: forgotPasswordType) {
		mutate(values);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Forgot your password?</CardTitle>
					<CardDescription>
						Enter your email address and we will send you a link to
						reset your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-8"
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="m@example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
							>
								{isPending ? "Loading..." : "Send reset link"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}