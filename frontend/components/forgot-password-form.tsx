import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold">Email</Label>
                <Input id="email" type="email" placeholder="trader@example.com" required className="placeholder:text-foreground" />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <a href="/login" className="text-primary hover:underline">
                Back to login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
