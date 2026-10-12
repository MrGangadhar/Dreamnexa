import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../src/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import client from '../src/api/client';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function Probe() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.username : 'none'}</div>
      <button onClick={() => login('priya_sharma', 'Demo@12345')}>do-login</button>
      <button onClick={() => logout()}>do-logout</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with loading=false and user=null when there is no stored token', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(client.get).not.toHaveBeenCalled();
  });

  it('restores the session from /users/me when an access token already exists', async () => {
    localStorage.setItem('accessToken', 'existing-token');
    client.get.mockResolvedValue({ data: { username: 'priya_sharma', role: 'student' } });

    renderProbe();

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('priya_sharma'));
    expect(client.get).toHaveBeenCalledWith('/users/me');
  });

  it('falls back to a logged-out state if the stored token is invalid', async () => {
    localStorage.setItem('accessToken', 'stale-token');
    client.get.mockRejectedValue({ response: { status: 401 } });

    renderProbe();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('login() stores tokens in localStorage and sets the user', async () => {
    client.post.mockResolvedValue({
      data: { accessToken: 'tok-a', refreshToken: 'tok-r', user: { username: 'priya_sharma', role: 'student' } },
    });
    client.get.mockResolvedValue({ data: { username: 'priya_sharma', role: 'student' } });

    const user = userEvent.setup();
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByText('do-login'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('priya_sharma'));
    expect(localStorage.getItem('accessToken')).toBe('tok-a');
    expect(localStorage.getItem('refreshToken')).toBe('tok-r');
  });

  it('logout() clears localStorage and the user, and calls the logout endpoint', async () => {
    localStorage.setItem('accessToken', 'tok-a');
    localStorage.setItem('refreshToken', 'tok-r');
    client.get.mockResolvedValue({ data: { username: 'priya_sharma', role: 'student' } });
    client.post.mockResolvedValue({ data: {} });

    const user = userEvent.setup();
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('priya_sharma'));

    await user.click(screen.getByText('do-logout'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    expect(client.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'tok-r' });
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('logout() still clears local state even if the server call fails', async () => {
    localStorage.setItem('accessToken', 'tok-a');
    localStorage.setItem('refreshToken', 'tok-r');
    client.get.mockResolvedValue({ data: { username: 'priya_sharma', role: 'student' } });
    client.post.mockRejectedValue(new Error('network down'));

    const user = userEvent.setup();
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('priya_sharma'));

    await user.click(screen.getByText('do-logout'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
