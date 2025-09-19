import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>Enter the token from your email and create a new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="token" className="font-bold">Reset Token</Label>
                <Input id="token" type="text" placeholder="Enter the token from your email" required className="placeholder:text-foreground" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-bold">New Password</Label>
                <Input id="password" type="password" placeholder="Enter your new password" required className="placeholder:text-foreground" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="font-bold">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm your new password" required className="placeholder:text-foreground" />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Reset Password
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
