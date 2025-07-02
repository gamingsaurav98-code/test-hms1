#!/bin/bash

echo "Removing lucide-react..."
npm uninstall lucide-react

echo "Clearing npm cache..."
npm cache clean --force

echo "Reinstalling lucide-react..."
npm install lucide-react

echo "Checking lucide-react installation..."
npm list lucide-react

echo "Installation complete. If the issue persists, try running 'npm install' to refresh all dependencies."
