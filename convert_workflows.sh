#!/bin/bash

# Ensure the global skills directory exists
mkdir -p ~/.gemini/config/skills

# Convert each workflow into a proper Antigravity skill
for file in ~/.gemini/config/workflows/*.md; do
  if [ -f "$file" ]; then
    # Get the base name (e.g., build-fix)
    basename=$(basename "$file" .md)
    
    # Create the skill directory
    skill_dir="~/.gemini/config/skills/$basename"
    eval skill_dir=$skill_dir
    mkdir -p "$skill_dir"
    
    # Copy the markdown content
    cp "$file" "$skill_dir/SKILL.md"
    
    # Inject the required 'name' field into the frontmatter so Antigravity CLI picks it up
    if head -n 1 "$skill_dir/SKILL.md" | grep -q "^---"; then
      awk -v name="$basename" 'NR==1 {print; print "name: " name; next} {print}' "$skill_dir/SKILL.md" > "$skill_dir/SKILL.tmp"
      mv "$skill_dir/SKILL.tmp" "$skill_dir/SKILL.md"
    else
      # If no frontmatter exists, add it
      echo "---" > "$skill_dir/SKILL.tmp"
      echo "name: $basename" >> "$skill_dir/SKILL.tmp"
      echo "description: $basename workflow" >> "$skill_dir/SKILL.tmp"
      echo "---" >> "$skill_dir/SKILL.tmp"
      cat "$skill_dir/SKILL.md" >> "$skill_dir/SKILL.tmp"
      mv "$skill_dir/SKILL.tmp" "$skill_dir/SKILL.md"
    fi
    
    echo "Converted /$basename to Antigravity skill"
  fi
done

echo "Done! Please restart your Antigravity CLI (Ctrl+D and run agy again) to see the commands in autocomplete."
