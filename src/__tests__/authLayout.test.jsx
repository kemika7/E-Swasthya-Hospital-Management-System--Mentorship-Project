import { render, screen } from '@testing-library/react';
import AuthLayout from '../components/AuthLayout';

test('renders children inside right panel', () => {
  render(<AuthLayout><div>Child</div></AuthLayout>);
  expect(screen.getByText('Child')).toBeInTheDocument();
});
