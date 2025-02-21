// Common styles that can be reused across all email templates
export const emailStyles = {
  // Layout
  logoContainer: {
    textAlign: "center" as const,
    margin: "30px 0",
  },
  logo: {
    width: "150px",
    height: "40px",
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px',
    maxWidth: '600px',
    borderRadius: '8px',
  },
  section: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },

  // Typography
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "left" as const,
    margin: "0 0 15px",
    color: "#1f2937", // gray-900
  },
  subheading: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "25px 0 10px",
    color: "#374151", // gray-800
  },
  text: {
    margin: "15px 0",
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563", // gray-700
  },
  body: {
    backgroundColor: '#f5f7ff',
    padding: '40px 0',
    margin: '0',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    minHeight: '100vh',
    width: '100%',
  },

  // Interactive elements
  button: {
    backgroundColor: "#8b5cf6", // purple
    borderRadius: "6px",
    color: "#ffffff",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 20px",
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "30px 0",
  },

  // Lists
  list: {
    margin: "15px 0",
    paddingLeft: "20px",
  },
  listItem: {
    margin: "10px 0",
  },

  // Dividers
  hr: {
    borderColor: "#e5e7eb", // gray-200
    margin: "30px 0",
  },

  // Footer elements
  signature: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#374151", // gray-800
  },
  footerText: {
    fontSize: "14px",
    color: "#6b7280", // gray-500
    textAlign: "center" as const,
  },
} as const;

export const theme = {
  fonts: {
    primary: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  },
  
  colors: {
    primary: '#8b5cf6',
    secondary: '#4B5563',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    background: '#F9FAFB',
    white: '#FFFFFF',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      light: '#9CA3AF',
    }
  },

  typography: {
    h1: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '700',
      fontFamily: 'inherit',
      color: '#111827',
    },
    h2: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: '600',
      fontFamily: 'inherit',
      color: '#1F2937',
    },
    body: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
      fontFamily: 'inherit',
      color: '#4B5563',
    },
    small: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
      fontFamily: 'inherit',
      color: '#6B7280',
    }
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  containers: {
    main: {
      maxWidth: '600px',
      padding: '24px',
      backgroundColor: '#f5f7ff',
    },
    section: {
      padding: '24px',
      marginBottom: '24px',
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }
  },

  buttons: {
    primary: {
      backgroundColor: '#8b5cf6',
      color: '#FFFFFF',
      padding: '12px 24px',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '16px',
      textDecoration: 'none',
      display: 'inline-block',
      textAlign: 'center' as const,
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      color: '#8b5cf6',
      padding: '12px 24px',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '16px',
      textDecoration: 'none',
      display: 'inline-block',
      textAlign: 'center' as const,
      border: '1px solid #8b5cf6',
    }
  },

  hr: {
    borderColor: "#e5e7eb", // gray-200
    margin: "30px 0",
  },
} as const;

// Re-export individual constants for backward compatibility
export const { colors, spacing, typography, containers } = theme; 