import { render, screen } from '@testing-library/react'
import Home from './page'

// Mock the actions to prevent API calls during render tests
jest.mock('./actions', () => ({
  generateControlsAction: jest.fn(),
  generateRecipeAction: jest.fn(),
}))

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByText('What are you craving?')
    expect(heading).toBeInTheDocument()
  })
})
