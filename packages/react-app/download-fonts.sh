#!/bin/bash

# Create fonts directory if it doesn't exist
mkdir -p public/fonts

# Download Inter fonts
echo "Downloading Inter fonts..."
curl -s -o public/fonts/Inter-Regular.woff2 "https://rsms.me/inter/font-files/Inter-Regular.woff2"
curl -s -o public/fonts/Inter-Medium.woff2 "https://rsms.me/inter/font-files/Inter-Medium.woff2"
curl -s -o public/fonts/Inter-SemiBold.woff2 "https://rsms.me/inter/font-files/Inter-SemiBold.woff2"
curl -s -o public/fonts/Inter-Bold.woff2 "https://rsms.me/inter/font-files/Inter-Bold.woff2"

# Download JetBrains Mono fonts
echo "Downloading JetBrains Mono fonts..."
curl -s -o public/fonts/JetBrainsMono-Regular.woff2 "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-Regular.woff2"
curl -s -o public/fonts/JetBrainsMono-Medium.woff2 "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-Medium.woff2"

echo "Font download complete!" 