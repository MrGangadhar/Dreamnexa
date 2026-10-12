import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router's useNavigate so we can assert on redirects without a full router.
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

// Mock the API client so no real network calls happen.
vi.mock('../src/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import client from '../src/api/client';
import { AuthProvider } from '../src/context/AuthContext';
import Login from '../src/pages/Login';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    client.get.mockResolvedValue({ data: null }); // AuthProvider's initial /users/me probe (no token, won't fire)
  });

  it('renders username/email and password fields plus the submit button', () => {
    renderLogin();
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows the demo credential hint with the CURRENT seeded student username', () => {
    // Regression test: this used to say "john_doe / Pass@12345", which does
    // not match any account seed.js actually creates.
    renderLogin();
    expect(screen.getByText(/priya_sharma/)).toBeInTheDocument();
    expect(screen.queryByText(/john_doe/)).not.toBeInTheDocument();
  });

  it('requires both fields before the browser allows submission', () => {
    renderLogin();
    const userField = screen.getByLabelText(/username or email/i);
    const passField = screen.getByLabelText('Password');
    expect(userField).toBeRequired();
    expect(passField).toBeRequired();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    const passField = screen.getByLabelText('Password');
    expect(passField).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password|hide password/i }));
    expect(passField).toHaveAttribute('type', 'text');
  });

  it('logs in a student and redirects to /dashboard', async () => {
    client.post.mockResolvedValue({
      data: {
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        user: { id: 'u1', username: 'priya_sharma', role: 'student' },
      },
    });

    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username or email/i), 'priya_sharma');
    await user.type(screen.getByLabelText('Password'), 'Demo@12345');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith('/auth/login', {
        usernameOrEmail: 'priya_sharma',
        password: 'Demo@12345',
      });
    });
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/dashboard'));
    expect(localStorage.getItem('accessToken')).toBe('access-123');
  });

  it('logs in an admin and redirects to /admin', async () => {
    client.post.mockResolvedValue({
      data: {
        accessToken: 'access-admin',
        refreshToken: 'refresh-admin',
        user: { id: 'admin1', username: 'admin', role: 'admin' },
      },
    });

    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username or email/i), 'admin');
    await user.type(screen.getByLabelText('Password'), 'Admin@12345');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/admin'));
  });

  it('shows the server error message on invalid credentials and does not navigate', async () => {
    client.post.mockRejectedValue({ response: { data: { error: 'Invalid credentials.' } } });

    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username or email/i), 'wrong_user');
    await user.type(screen.getByLabelText('Password'), 'wrong_password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('falls back to a generic error message when the server gives no error body', async () => {
    client.post.mockRejectedValue(new Error('Network Error'));

    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username or email/i), 'someone');
    await user.type(screen.getByLabelText('Password'), 'somepassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });

  it('disables the submit button and shows a loading label while the request is in flight', async () => {
    let resolveLogin;
    client.post.mockReturnValue(new Promise((resolve) => { resolveLogin = resolve; }));

    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username or email/i), 'priya_sharma');
    await user.type(screen.getByLabelText('Password'), 'Demo@12345');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('button', { name: /logging in/i })).toBeDisabled();

    resolveLogin({ data: { accessToken: 'a', refreshToken: 'r', user: { role: 'student' } } });
    await waitFor(() => expect(navigateMock).toHaveBeenCalled());
  });
});
