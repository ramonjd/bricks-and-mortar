import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
	it('renders with default props', () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole('button', { name: /click me/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('bg-blue-600'); // primary variant class
	});

	it('renders with secondary variant', () => {
		render(<Button variant="secondary">Secondary</Button>);
		const button = screen.getByRole('button', { name: /secondary/i });
		expect(button).toHaveClass('bg-gray-200'); // secondary variant class
	});

	it('renders with outline variant', () => {
		render(<Button variant="outline">Outline</Button>);
		const button = screen.getByRole('button', { name: /outline/i });
		expect(button).toHaveClass('border'); // outline variant class
	});

	it('calls onClick handler when clicked', async () => {
		const handleClick = jest.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		const button = screen.getByRole('button', { name: /click me/i });
		await userEvent.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});
