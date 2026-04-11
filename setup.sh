#!/bin/bash

# ApnaGaon - Quick Start Setup Script
# Run this script to initialize the project for development

echo "🚀 ApnaGaon - Village Commerce Platform Setup"
echo "=============================================\n"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "\n📦 Installing dependencies..."
npm install

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    echo "\n⚙️  Creating .env.local..."
    cp .env.example .env.local
    echo "✅ .env.local created. Update with your settings if needed."
else
    echo "\n✅ .env.local already exists"
fi

echo "\n✨ Setup complete!"
echo "\n📱 To start development server, run:"
echo "   npm run dev"
echo "\n🏗️  To build for production, run:"
echo "   npm run build"
echo "\n📖 For more information, see PROJECT_GUIDE.md"
