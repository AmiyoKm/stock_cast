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
