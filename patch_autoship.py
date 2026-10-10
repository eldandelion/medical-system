import sys

file_path = '/Users/daniel/.gemini/config/skills/auto-ship/SKILL.md'
with open(file_path, 'r') as f:
    content = f.read()

new_principle = "- **Subagent Delegation for Research:** Always use specialized subagents for research tasks (be it general research or code/codebase research) to preserve the main context and benefit from specialized scoping.\n- **Strict File Boundaries:**"

content = content.replace("- **Strict File Boundaries:**", new_principle)

with open(file_path, 'w') as f:
    f.write(content)

print("Updated SKILL.md")
