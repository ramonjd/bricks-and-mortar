import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import { useLocale, usePathname, useRouter } from '@/lib/i18n/client';
import { locales } from '@/lib/i18n/config';

// Mock the i18n hooks
jest.mock('@/lib/i18n/client', () => ({
  useLocale: jest.fn(),
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

describe('LanguageSwitcher', () => {
  const mockReplace = jest.fn();
  
  beforeEach(() => {
    // Setup default mock values
    (useLocale as jest.Mock).mockReturnValue('en');
    (usePathname as jest.Mock).mockReturnValue('/test-path');
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with the current locale selected', () => {
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('en');
  });
  
  it('displays all available locales as options', () => {
    render(<LanguageSwitcher />);
    
    locales.forEach(locale => {
      const option = screen.getByRole('option', { name: new RegExp(locale.toUpperCase()) });
      expect(option).toBeInTheDocument();
    });
  });
  
  it('calls router.replace with the new locale when changed', () => {
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'de' } });
    
    expect(mockReplace).toHaveBeenCalledWith('/test-path', { locale: 'de' });
  });
}); 