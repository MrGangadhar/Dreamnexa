import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../src/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import client from '../src/api/client';
import { AuthProvider } from '../src/context/AuthContext';
import Register from '../src/pages/Register';

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    client.get.mockResolvedValue({ data: null });
  });

  it('renders all expected fields', () => {
    renderRegister();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/referral code/i)).toBeInTheDocument();
  });

  it('enforces minLength on username and password', () => {
    renderRegister();
    expect(screen.getByLabelText(/^username$/i)).toHaveAttribute('minLength', '3');
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('minLength', '8');
  });

  it('marks required fields as required and mobile/referral as optional', () => {
    renderRegister();
    expect(screen.getByLabelText(/full name/i)).toBeRequired();
    expect(screen.getByLabelText(/^username$/i)).toBeRequired();
    expect(screen.getByLabelText(/^email$/i)).toBeRequired();
    expect(screen.getByLabelText(/^password$/i)).toBeRequired();
    expect(screen.getByLabelText(/mobile/i)).not.toBeRequired();
    expect(screen.getByLabelText(/referral code/i)).not.toBeRequired();
  });

  it('submits the form and redirects to /dashboard on success', async () => {
    client.post.mockResolvedValue({
      data: {
        accessToken: 'access-xyz',
        refreshToken: 'refresh-xyz',
        user: { id: 'u2', username: 'new_student', role: 'student' },
      },
    });

    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/full name/i), 'New Student');
    await user.type(screen.getByLabelText(/^username$/i), 'new_student');
    await user.type(screen.getByLabelText(/^email$/i), 'new_student@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({ username: 'new_student', email: 'new_student@example.com' })
      );
    });
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/dashboard'));
    expect(localStorage.getItem('accessToken')).toBe('access-xyz');
  });

  it('shows the server error on a duplicate-account response and does not navigate', async () => {
    client.post.mockRejectedValue({
      response: { data: { error: 'A record with these details already exists.' } },
    });

    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/full name/i), 'Dupe User');
    await user.type(screen.getByLabelText(/^username$/i), 'dupe_user');
    await user.type(screen.getByLabelText(/^email$/i), 'dupe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('passes the referral code through to the register payload when provided', async () => {
    client.post.mockResolvedValue({
      data: { accessToken: 'a', refreshToken: 'r', user: { role: 'student' } },
    });

    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/full name/i), 'Referred User');
    await user.type(screen.getByLabelText(/^username$/i), 'referred_user');
    await user.type(screen.getByLabelText(/^email$/i), 'referred@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/referral code/i), 'ROHI3F9A');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({ referralCode: 'ROHI3F9A' })
      );
    });
  });
});
