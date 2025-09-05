import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SentimentAnalyzer from '@/components/sentiment-analyzer'

describe('SentimentAnalyzer', () => {
  it('renders the URL input', () => {
    render(<SentimentAnalyzer />)
    expect(screen.getByPlaceholderText(/https:\/\/example.com\/news-article/i)).toBeInTheDocument()
  })

  it('shows error for invalid URL', async () => {
    render(<SentimentAnalyzer />)
    
    const input = screen.getByPlaceholderText(/https:\/\/example.com\/news-article/i)
    const submitButton = screen.getByText(/analyze/i)

    fireEvent.change(input, { target: { value: 'invalid-url' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
    })
  })
}) 