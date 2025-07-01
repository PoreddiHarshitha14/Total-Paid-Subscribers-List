import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header banner', () => {
  render(<App />);
  const headerElement = screen.getByText(/Subscriber Management/i);
  expect(headerElement).toBeInTheDocument();
});