# Contributing to Sentiment Analysis App

Thank you for your interest in contributing to the Sentiment Analysis App! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- pnpm (preferred) or npm
- Python 3.8+ for backend development
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the \"Fork\" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/sentiment-analysis-app.git
   cd sentiment-analysis-app
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/sentiment-analysis-app.git
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   pip install -r requirements.txt
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   python backend/run_stable.py
   
   # Terminal 2 - Frontend  
   pnpm dev
   ```

## 🔄 Development Process

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/feature-name`: New features
- `bugfix/bug-description`: Bug fixes
- `hotfix/critical-fix`: Critical production fixes

### Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our [coding standards](#coding-standards)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm test
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m \"feat: add your feature description\"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 📝 Pull Request Guidelines

### PR Title Format
Use [Conventional Commits](https://conventionalcommits.org/) format:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process

1. **Automated Checks**: All PRs must pass automated tests
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing for UI/UX changes
4. **Documentation**: Ensure docs are updated for new features

## 🎨 Coding Standards

### JavaScript/React

- Use modern JavaScript (ES6+)
- Follow React best practices and hooks patterns
- Use functional components over class components
- Implement proper error boundaries
- Use meaningful variable and function names

### File Organization

```
components/
├── ui/           # Reusable UI components
├── [feature]/    # Feature-specific components
└── common/       # Shared components

lib/
├── utils.js      # Utility functions
├── db.js         # Database utilities
└── api.js        # API helpers
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS variables for theme values

### Python/Backend

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Implement proper error handling
- Add docstrings for functions and classes

## 🧪 Testing Guidelines

### Frontend Testing

- Write unit tests for utility functions
- Add component tests for UI components
- Include integration tests for complex features
- Test accessibility features

### Test Structure

```javascript
// Example test
import { render, screen, fireEvent } from '@testing-library/react'
import SentimentAnalyzer from '../sentiment-analyzer'

describe('SentimentAnalyzer', () => {
  it('should render input field', () => {
    render(<SentimentAnalyzer />)
    expect(screen.getByPlaceholderText(/enter url/i)).toBeInTheDocument()
  })
  
  it('should handle form submission', async () => {
    // Test implementation
  })
})
```

### Backend Testing

- Add unit tests for API endpoints
- Test error handling scenarios
- Validate input/output schemas
- Test rate limiting functionality

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Include inline comments for complex logic
- Update README for new features
- Document API changes

### Component Documentation

```javascript
/**
 * SentimentMeter - Displays sentiment score as a circular gauge
 * 
 * @param {number} value - Sentiment score (0-100)
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 * @param {string} className - Additional CSS classes
 */
export function SentimentMeter({ value, size = 'md', className }) {
  // Implementation
}
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information
- Console errors

### Feature Requests

For feature requests, include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation approach
- Mockups or wireframes if applicable

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority:high`: High priority issues
- `priority:low`: Low priority issues

## 💬 Communication

- Use GitHub Issues for bug reports and feature requests
- Use GitHub Discussions for questions and general discussions
- Be patient and respectful in all communications
- Provide context and details when asking for help

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Recognition

All contributors will be recognized in our README and release notes. Thank you for helping make this project better!

---

**Questions?** Feel free to open an issue or reach out to the maintainers.