import z from "zod"

export const registerSchema = z.object({
    name: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})
export type registerSchemaType = z.infer<typeof registerSchema>

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().nonempty(),
})
export type loginSchemaType = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
    email: z.string().email()
})
export type forgotPasswordType = z.infer<typeof forgotPasswordSchema>

export const updatePasswordSchema = z.object({
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    token: z.string()
})
export type updatePasswordType = z.infer<typeof updatePasswordSchema>

export const activateUserSchema = z.object({
    token: z.string()
})
export type activateUserType = z.infer<typeof activateUserSchema>
