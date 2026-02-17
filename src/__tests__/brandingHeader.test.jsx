import { render, screen } from '@testing-library/react';
import BrandingHeader from '../components/BrandingHeader';

test('renders logo and title', () => {
  render(<BrandingHeader />);
  expect(screen.getByAltText('E-SWASTHYA Logo')).toBeInTheDocument();
  expect(screen.getByText('E-SWASTHYA')).toBeInTheDocument();
});
