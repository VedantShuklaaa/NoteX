"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import axios from "axios";
import { signIn } from 'next-auth/react';

interface SignupFormData {
    email: string;
    password: string;
    displayName?: string;
}

interface SignupResponse {
    message: string;
    user: {
        id: string;
        email: string;
        displayName: string;
        createdAt: string;
    };
}

interface ErrorResponse {
    error: string;
    details?: any;
}

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState<SignupFormData>({
        email: "",
        password: "",
        displayName: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        setError("");
    };

    const handleGoogleSignup = () => {
        signIn('google', { callbackUrl: '/navs/auth/userDashboard' });
      };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.email || !formData.password) {
            setError("Please fill in all required fields");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post<SignupResponse>(
                "/api/auth/signup",
                {
                    email: formData.email,
                    password: formData.password,
                    displayName: formData.displayName || undefined,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccess("Account created successfully! Redirecting to login...");

            setTimeout(() => {
                router.push("/navs/auth/login");
            }, 1500);

        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errorData = err.response?.data as ErrorResponse;
                setError(errorData?.error || "Signup failed. Please try again.");
            } else {
                setError("An unexpected error occurred");
            }
            console.error("Signup error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute font-[roboto_Condensed] shadow-input mx-auto w-[90vw] md:w-full max-w-md p-4 rounded-xl md:p-8 border-black/10 dark:border-white/20 bg-transparent backdrop-blur-lg dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)]">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Join NoteX
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Sign up now — beta testers, imagination required.
            </p>

            <form className="my-8" onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                    </div>
                )}

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="displayName">Display Name (Optional)</Label>
                    <Input
                        id="displayName"
                        placeholder="John Doe"
                        type="text"
                        value={formData.displayName}
                        onChange={handleChange}
                        disabled={loading}
                        maxLength={50}
                        className="rounded-xl"
                    />
                </LabelInputContainer>

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="projectmayhem@fc.com"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        className="rounded-xl"
                    />
                </LabelInputContainer>

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        minLength={8}
                        className="rounded-xl"
                    />
                    <p className="text-xs text-neutral-700 dark:text-neutral-400 mt-1">
                        Must be at least 8 characters long
                    </p>
                </LabelInputContainer>

                <button
                    className="group/btn relative cursor-pointer block h-10 w-full rounded-xl bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating account...
                        </span>
                    ) : (
                        <>
                            Sign up &rarr;
                            <BottomGradient />
                        </>
                    )}
                </button>

                <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                <div className="flex flex-col space-y-4">
                    <button
                        className="group/btn shadow-input cursor-pointer relative flex h-10 w-full items-center justify-start space-x-2 rounded-xl bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        disabled={loading}
                        onClick={handleGoogleSignup}
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            Sign up with Google
                        </span>
                        <BottomGradient />
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-neutral-800 dark:text-neutral-200 font-medium hover:underline cursor-pointer"
                        disabled={loading}
                    >
                        Log in
                    </button>
                </p>
            </form>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};