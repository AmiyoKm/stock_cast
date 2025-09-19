import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center space-y-2">
                    <CardDescription>Create your account to start tracking and predicting stock prices</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username" className="font-bold">Username</Label>
                                <Input id="username" type="text" placeholder="trader123" required className="placeholder:text-muted-foreground" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-bold">Email</Label>
                                <Input id="email" type="email" placeholder="trader@example.com" required className="placeholder:text-muted-foreground" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="font-bold">Password</Label>
                                <Input id="password" type="password" placeholder="Create a strong password" required className="placeholder:text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full">
                                    Start Trading
                                </Button>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <a href="/login" className="text-primary hover:underline">
                                Sign in
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
