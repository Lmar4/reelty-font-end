/// <reference types="vitest" />
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoginForm } from "@/app/auth/_components/login-form";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    signIn: vi.fn(),
    user: null,
  })),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid='loading-spinner'>Loading...</div>,
}));

describe("LoginForm", () => {
  const mockSignIn = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockImplementation(() => ({
      signIn: mockSignIn,
      user: null,
    }));
  });

  it("renders login form", () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it("handles successful login", async () => {
    mockSignIn.mockResolvedValueOnce({});

    render(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);
    });

    expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");

    // Update the auth state to simulate successful login
    await act(async () => {
      (useAuth as any).mockImplementation(() => ({
        signIn: mockSignIn,
        user: {
          uid: "user1",
          email: "test@example.com",
        },
      }));
    });

    // Wait for the useEffect to run and call onSuccess
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        id: "user1",
        email: "test@example.com",
      });
      expect(toast.success).toHaveBeenCalledWith("Successfully signed in");
    });
  });

  it("handles login error", async () => {
    const error = new Error("Invalid credentials");
    mockSignIn.mockRejectedValueOnce(error);

    render(<LoginForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);
    });

    expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });
});
