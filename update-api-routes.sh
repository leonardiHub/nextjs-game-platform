#!/bin/bash

# Script to update all API routes to use correct backend ports
# Local: 3006, Production: 5001

echo "Updating API routes to use correct backend ports..."

# Find all route.ts files in src/app/api
find src/app/api -name "route.ts" -type f | while read file; do
    echo "Updating $file..."
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Process the file to replace the backend URL
    sed 's|http://localhost:3006|${backendUrl}|g' "$file" > "$temp_file"
    
    # Check if the file was modified
    if ! cmp -s "$file" "$temp_file"; then
        # Add the backend URL logic at the beginning of the function
        sed -i 's|const response = await fetch('\''\${backendUrl}|const backendUrl = process.env.NODE_ENV === '\''production'\'' \n      ? '\''http://localhost:5001'\'' \n      : '\''http://localhost:3006'\''\n    const response = await fetch(`\${backendUrl}|g' "$temp_file"
        
        # Move the temp file back
        mv "$temp_file" "$file"
        echo "  ✓ Updated $file"
    else
        rm "$temp_file"
        echo "  - No changes needed for $file"
    fi
done

echo "API routes update completed!"

