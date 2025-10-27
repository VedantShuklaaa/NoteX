import jwt from "jsonwebtoken";

const JWT_PASSWORD = process.env.JWT_PASSWORD as string

export function getUserFromToken(token: string) {
    try {
        const payload = jwt.verify(token, JWT_PASSWORD) as { email: string; id: string };
        return payload;
    } catch (err: any) {
        return null;
    }
}