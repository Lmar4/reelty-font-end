/// <reference types="vitest" />
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Auth from "@/app/auth/page";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/common/Toast";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock hooks
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/common/Toast", () => ({
  useToast: vi.fn(),
}));

// Mock Form component
vi.mock("@/components/common/Form", () => {
  const Form = ({ children, onSubmit, schema }: any) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        schema.parse(data);
        onSubmit(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            const errorElement = document.createElement("p");
            errorElement.textContent = err.message;
            errorElement.className = "text-sm text-red-600";
            const field = document.querySelector(`[name="${err.path[0]}"]`);
            field?.parentElement?.appendChild(errorElement);
          });
        }
      }
    };

    return (
      <form onSubmit={handleSubmit} noValidate>
        {children}
      </form>
    );
  };

  const FormField = ({ name, label, type = "text", placeholder }: any) => {
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          data-testid={name}
        />
      </div>
    );
  };

  return {
    __esModule: true,
    default: Form,
    FormField,
  };
});

describe("Auth Page", () => {
  const mockRouter = {
    push: vi.fn(),
  };
  const mockShowToast = vi.fn();
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignInWithGoogle = vi.fn();
  const mockSearchParams = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useSearchParams as any).mockReturnValue(mockSearchParams);
    (useAuth as any).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
    });
    (useToast as any).mockReturnValue({
      showToast: mockShowToast,
    });
    mockSearchParams.get.mockReturnValue("/dashboard");
  });

  it("renders sign in form by default", () => {
    render(<Auth />);
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("switches to sign up form", async () => {
    render(<Auth />);
    const switchButton = screen.getByText(/need an account\? sign up/i);
    await fireEvent.click(switchButton);
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  });

  it("handles successful sign in", async () => {
    mockSignIn.mockResolvedValueOnce({});
    render(<Auth />);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    await fireEvent.change(passwordInput, { target: { value: "password123" } });
    await fireEvent.submit(submitButton.closest("form")!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles successful sign up", async () => {
    mockSignUp.mockResolvedValueOnce({});
    render(<Auth />);

    const switchButton = screen.getByText(/need an account\? sign up/i);
    await fireEvent.click(switchButton);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    await fireEvent.change(passwordInput, { target: { value: "password123" } });
    await fireEvent.submit(submitButton.closest("form")!);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        "Account created successfully!",
        "success"
      );
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles sign in error", async () => {
    const error = new Error("Invalid credentials");
    mockSignIn.mockRejectedValueOnce(error);

    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    await fireEvent.change(passwordInput, { target: { value: "password123" } });
    await fireEvent.submit(submitButton.closest("form")!);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Invalid credentials",
        "error"
      );
    });
  });

  it("handles Google sign in", async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({});
    render(<Auth />);

    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });
    await fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles Google sign in error", async () => {
    const error = new Error("Google sign-in failed");
    mockSignInWithGoogle.mockRejectedValueOnce(error);

    render(<Auth />);
    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });
    await fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Google sign-in failed",
        "error"
      );
    });
  });

  it("validates email format", async () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.submit(submitButton.closest("form")!);
    });

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("validates password length", async () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "12345" } });
      fireEvent.submit(submitButton.closest("form")!);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters")
      ).toBeInTheDocument();
    });
  });
});
