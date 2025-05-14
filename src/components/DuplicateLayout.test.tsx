import { render, screen, fireEvent } from '@testing-library/react';
import DuplicateLayout from '@/components/DuplicateLayout';

describe('DuplicateLayout', () => {
  const baseProps = {
    title: 'Test Title',
    searchValue: '',
    onSearch: jest.fn()
  };

  it('renders the title and children', () => {
    render(
      <DuplicateLayout {...baseProps}>
        <div>Child content</div>
      </DuplicateLayout>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('calls onSearch when Enter is pressed', () => {
    render(
      <DuplicateLayout {...baseProps}>
        <div />
      </DuplicateLayout>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(baseProps.onSearch).toHaveBeenCalledWith('test');
  });
});
