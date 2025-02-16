import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { useS3Upload } from "../hooks/use-s3-upload";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Mock } from "vitest";

// Mock the modules
vi.mock("@clerk/nextjs", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Create a test component
function TestComponent() {
  const { uploadToS3, isUploading } = useS3Upload();

  const handleUpload = async () => {
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    try {
      await uploadToS3(
        [
          {
            id: "1",
            originalFile: file,
            webpBlob: file,
            previewUrl: "test-url",
            status: "idle",
          },
        ],
        true
      );
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div>
      <button onClick={handleUpload}>Upload</button>
      {isUploading && <div>Uploading...</div>}
    </div>
  );
}

// Mock XMLHttpRequest
class MockXHR {
  open = vi.fn();
  send = vi.fn().mockImplementation(() => {
    Promise.resolve().then(() => {
      if (this.status === 200) {
        this.readyState = 4;
        this.onload();
      } else {
        this.readyState = 4;
        this.onerror();
      }
    });
  });
  setRequestHeader = vi.fn();
  upload = {};
  readyState = 0;
  status = 200;
  responseText = '';
  onload: () => void = () => {};
  onerror: () => void = () => {};

  addEventListener(event: string, handler: any) {
    if (event === 'load') this.onload = handler;
    if (event === 'error') this.onerror = handler;
  }

  triggerLoad() {
    this.readyState = 4;
    this.onload();
  }

  triggerError() {
    this.readyState = 4;
    this.onerror();
  }
}

// Helper to wait for all promises to resolve
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

describe("Upload Flow", () => {
  vi.setConfig({ testTimeout: 30000 });

  beforeEach(() => {
    // Setup fake timers
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-02-16'));
    // Reset all mocks
    vi.clearAllMocks();

    // Mock console.error
    console.error = vi.fn();

    // Mock XMLHttpRequest
    const mockXHR = new MockXHR();
    vi.stubGlobal('XMLHttpRequest', vi.fn(() => mockXHR));

    // Mock fetch
    global.fetch = vi.fn();

    // Mock router
    const mockRouter = {
      push: vi.fn(),
    };
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  it("should handle unauthenticated upload correctly", async () => {
    vi.useFakeTimers();
    // Mock unauthenticated state
    (useAuth as Mock).mockReturnValue({
      userId: null,
      isSignedIn: false,
    });

    // Mock the presigned URL response
    const mockXHR = new MockXHR();
    setTimeout(() => {
      mockXHR.onload();
    }, 100);
    
    (global.fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              url: "test-presigned-url",
              key: "test-key",
              sessionId: "test-session",
            })
          ),
      })
    );

    const { getByText } = render(<TestComponent />);

    // Trigger upload
    fireEvent.click(getByText("Upload"));
    
    // Wait for promises and advance timers
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();

    // Verify the fetch was called with correct params
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/storage/presigned-url",
        expect.any(Object)
      );
    }, { timeout: 2000 });

    // Verify the request body
    const fetchCall = (global.fetch as Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.isTemporary).toBe(true);

    // Verify XHR was called with correct params
    await waitFor(() => {
      const mockXHR = (XMLHttpRequest as unknown as Mock).mock.results[0].value;
      expect(mockXHR.open).toHaveBeenCalledWith('PUT', 'test-presigned-url');
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'image/webp');
      expect(mockXHR.send).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("should redirect to login when AUTH_REQUIRED error occurs", async () => {
    vi.useFakeTimers();
    // Mock the presigned URL to return HTML (auth redirect)
    (global.fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({
          'Content-Type': 'text/html'
        }),
        text: () => Promise.resolve("<!DOCTYPE html><html></html>"),
      })
    );
    // Mock unauthenticated state
    (useAuth as Mock).mockReturnValue({
      userId: null,
      isSignedIn: false,
    });

    // Mock fetch to return HTML (simulating redirect)
    (global.fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({
          'Content-Type': 'text/html'
        }),
        text: () => Promise.resolve("<!DOCTYPE html><html></html>"),
      })
    );

    const { getByText } = render(<TestComponent />);
    const router = useRouter();

    // Trigger upload
    fireEvent.click(getByText("Upload"));
    
    // Wait for promises and advance timers
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();
    vi.advanceTimersByTime(100);
    await flushPromises();

    // Verify the error was caught and handled
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/login");
    }, { timeout: 2000 });

    // Verify error was logged
    await waitFor(() => {
      const calls = (console.error as Mock).mock.calls;
      const hasAuthError = calls.some(call => 
        call[1]?.error === 'AUTH_REQUIRED' ||
        call[0]?.includes('AUTH_REQUIRED')
      );
      expect(hasAuthError).toBe(true);
    }, { timeout: 2000 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
    vi.clearAllMocks();
    (global as any).setImmediate = undefined;
  });
});
