/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch globally
beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
    if (url === 'http://localhost:8000/announcement' && (!options || options.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', title: 'Mock Announcement', description: 'Mock Desc', status: 'active', createdAt: new Date().toISOString() }
        ])
      } as Response);
    }

    if (url === 'http://localhost:8000/announcement' && options?.method === 'POST') {
      return Promise.resolve({ ok: true } as Response);
    }

    if (url?.toString().startsWith('http://localhost:8000/announcement/') && options?.method === 'PATCH') {
      return Promise.resolve({ ok: true } as Response);
    }

    return Promise.reject('Unknown request');
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders header and empty announcements initially', async () => {
  render(<App />);
  expect(screen.getByText(/Annoucements/i)).toBeInTheDocument();
  expect(screen.getByText(/Welcome to the Announcements App!/i)).toBeInTheDocument();
  
  // Wait for announcements to load
  await waitFor(() => {
    expect(screen.getByText('Mock Announcement')).toBeInTheDocument();
    expect(screen.getByText('Mock Desc')).toBeInTheDocument();
  });
});

test('can type in the form inputs', () => {
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'Test Title' } });
  fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'Test Desc' } });

  expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Test Desc')).toBeInTheDocument();
});

test('submits form and shows success message', async () => {
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'New Title' } });
  fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'New Desc' } });

  fireEvent.click(screen.getByText(/Create Announcement/i));

  await waitFor(() => {
    expect(screen.getByText(/Announcement created!/i)).toBeInTheDocument();
  });
});

test('toggles announcement status', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Mock Announcement')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText(/Set Closed/i));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/announcement/1'), expect.objectContaining({ method: 'PATCH' }));
  });
});
