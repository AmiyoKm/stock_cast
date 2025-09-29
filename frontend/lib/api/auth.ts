import { forgotPasswordType, loginSchemaType, registerSchemaType, updatePasswordType } from "@/schema/users";
import { postAPI } from "./utils";
import { EnvelopeLoginUser, EnvelopeRegisterUser } from "@/types/api";

const USERS_PATH = "/users"

export class AuthAPI {

    static async register(registerPaylod: registerSchemaType): Promise<EnvelopeRegisterUser> {
        return postAPI(`${USERS_PATH}/register`, registerPaylod)
    }

    static async login(loginPayload: loginSchemaType): Promise<EnvelopeLoginUser> {
        return postAPI(`${USERS_PATH}/login`, loginPayload)
    }

    static async forgotPassword(payload: forgotPasswordType): Promise<void> {
        return postAPI(`${USERS_PATH}/forgot-password`, payload)
    }

    static async updatePassword(payload: updatePasswordType): Promise<void> {
        return postAPI(`${USERS_PATH}/update-password`, payload)
    }
}
