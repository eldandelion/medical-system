import sys
import re

file_path = '/Users/daniel/.gemini/config/skills/auto-ship/SKILL.md'
with open(file_path, 'r') as f:
    content = f.read()

# Remove Phase 4
phase_4_pattern = r"### Phase 4: Safety Checkpoint \(Shadow Branch\)\n\*\*Goal:\*\* Create a zero-cost rollback point in case of hallucination spirals or corrupted configs during build repair\.\n1\. The main agent creates an automated shadow branch before any code is modified:\n   ```bash\n   git checkout -b temp/pre-auto-ship-checkpoint\n   ```\n\n"
content = re.sub(phase_4_pattern, "", content)

# Renumber subsequent phases
content = content.replace("### Phase 5: Implementation", "### Phase 4: Implementation")
content = content.replace("### Phase 6: Dual-Track Adversarial Review", "### Phase 5: Dual-Track Adversarial Review")
content = content.replace("### Phase 7: Verify Gate", "### Phase 6: Verify Gate")
content = content.replace("### Phase 8: Commit", "### Phase 7: Commit")

with open(file_path, 'w') as f:
    f.write(content)

print("Updated SKILL.md")
