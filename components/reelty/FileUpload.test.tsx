import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUpload from "./FileUpload";
import { toast } from "sonner";

// Mock fetch
global.fetch = jest.fn();

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
    }
  }
}

describe("FileUpload Component", () => {
  const mockOnFilesSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders upload button with default text", () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} />);
    expect(screen.getByText("Select listing photos")).toBeInTheDocument();
  });

  it("renders upload button with custom text", () => {
    render(
      <FileUpload
        buttonText='Custom Upload'
        onFilesSelected={mockOnFilesSelected}
      />
    );
    expect(screen.getByText("Custom Upload")).toBeInTheDocument();
  });

  it("allows file selection through input", async () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const mobileButton = screen
      .getByText("Select listing photos")
      .closest("button");

    await act(async () => {
      await userEvent.click(mobileButton!);
      const fileInput = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
    });
  });

  it("prevents selection of more than maxFiles", async () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} maxFiles={2} />);

    const files = [
      new File(["test1"], "test1.png", { type: "image/png" }),
      new File(["test2"], "test2.png", { type: "image/png" }),
      new File(["test3"], "test3.png", { type: "image/png" }),
    ];

    await act(async () => {
      const fileInput = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("You can only upload up to 2 files at once")
      );
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });
  });

  it("prevents selection of files larger than maxSize", async () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} maxSize={1} />);

    const largeFile = new File(["x".repeat(1024 * 1024 * 2)], "large.png", {
      type: "image/png",
    });

    await act(async () => {
      const fileInput = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Some files are larger than 1MB")
      );
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });
  });

  it("handles drag and drop file upload", async () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const dropZone = screen.getByTestId("dropzone");

    await act(async () => {
      fireEvent.dragOver(dropZone);
    });

    await waitFor(() => {
      expect(dropZone.className).toContain("border-[#8B5CF6]");
    });

    await act(async () => {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });
    });

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
    });
  });

  it("handles drag leave event", () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

    const dropZone = screen.getByTestId("dropzone");

    // Simulate drag events
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass("border-[#8B5CF6]");

    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass("border-[#8B5CF6]");
  });

  describe("File Type Validation", () => {
    it("accepts only image files by default", () => {
      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);
      const fileInput = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;
      expect(fileInput.accept).toBe("image/*");
    });

    it("rejects non-image files", async () => {
      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });

      await act(async () => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Invalid file type")
        );
        expect(mockOnFilesSelected).not.toHaveBeenCalled();
      });
    });

    it("accepts custom file types", async () => {
      render(
        <FileUpload onFilesSelected={mockOnFilesSelected} accept='.jpg,.png' />
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockOnFilesSelected).toHaveBeenCalled();
      });
    });
  });

  describe("Backend Integration", () => {
    it("uploads files to the backend with valid listingId", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <FileUpload
          onFilesSelected={mockOnFilesSelected}
          uploadUrl='/api/listings/123/photos'
        />
      );

      const file = new File(["test"], "test.png", { type: "image/png" });

      await act(async () => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/listings/123/photos",
          expect.objectContaining({
            method: "POST",
            body: expect.any(FormData),
          })
        );
        expect(toast.success).toHaveBeenCalledWith(
          "Files uploaded successfully"
        );
      });
    });

    it("handles undefined listingId in URL", async () => {
      render(
        <FileUpload
          onFilesSelected={mockOnFilesSelected}
          uploadUrl='/api/listings/undefined/photos'
        />
      );

      const file = new File(["test"], "test.png", { type: "image/png" });

      await act(async () => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Invalid listing ID")
        );
      });
    });

    it("handles invalid URL format", async () => {
      render(
        <FileUpload
          onFilesSelected={mockOnFilesSelected}
          uploadUrl='/api/listings//photos'
        />
      );

      const file = new File(["test"], "test.png", { type: "image/png" });

      await act(async () => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Invalid URL format")
        );
      });
    });

    it("handles network errors", async () => {
      const mockError = new Error("Network error");
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

      const file = new File(["test"], "test.png", { type: "image/png" });

      await act(async () => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Error uploading files")
        );
      });
    });

    it("handles server errors", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("Server error")),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

      const file = new File(["test"], "test.png", { type: "image/png" });
      const fileInput = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Server error")
        );
      });
    });
  });

  describe("Upload Progress", () => {
    it("shows upload progress indicator", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

      const file = new File(["test"], "test.png", { type: "image/png" });
      const fileInput = document.querySelector(
        "input[type='file']"
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

      const dropZone = screen.getByTestId("dropzone");
      expect(dropZone).toHaveAttribute("role", "button");
      expect(dropZone).toHaveAttribute(
        "aria-label",
        "Drop files here or click to select"
      );
      expect(dropZone).toHaveAttribute("tabIndex", "0");
    });

    it("handles keyboard interaction", async () => {
      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

      const dropZone = screen.getByTestId("dropzone");

      await act(async () => {
        dropZone.focus();
        fireEvent.keyDown(dropZone, { key: "Enter" });
      });

      await waitFor(() => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        expect(fileInput).toHaveFocus();
      });
    });

    it("handles space key", async () => {
      render(<FileUpload onFilesSelected={mockOnFilesSelected} />);

      const dropZone = screen.getByTestId("dropzone");

      await act(async () => {
        dropZone.focus();
        fireEvent.keyDown(dropZone, { key: " " });
      });

      await waitFor(() => {
        const fileInput = document.querySelector(
          "input[type='file']"
        ) as HTMLInputElement;
        expect(fileInput).toHaveFocus();
      });
    });
  });
});
