#!/usr/bin/env python3
"""Split migration SQL into separate files"""

import re

with open('/Users/admin/maincomby_bot/migration_data.sql', 'r') as f:
    content = f.read()

# Split by section headers
sections = re.split(r'(-- ={20} \w+ ={20})', content)

current_section = None
files = {}

for i, section in enumerate(sections):
    if '====================' in section:
        # Extract section name
        match = re.search(r'-- ={20} (\w+) ={20}', section)
        if match:
            current_section = match.group(1).lower()
            files[current_section] = section
    elif current_section:
        files[current_section] += section

# Write separate files
for name, sql in files.items():
    if sql.strip():
        filename = f'/Users/admin/maincomby_bot/migration_{name}.sql'
        with open(filename, 'w') as f:
            f.write(sql)
        print(f"Created: {filename} ({len(sql)} bytes)")

print("\nDone!")
