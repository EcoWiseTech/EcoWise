# Read input.txt and process lines
with open("input.txt", "r") as file:
    lines = file.readlines()

# Remove "All branches\t" and replace the tab with "="
cleaned_lines = [line.replace("All branches\t", "", 1).replace("\t", "=", 1) for line in lines]

# Write cleaned content to output.txt
with open("output.txt", "w") as file:
    file.writelines(cleaned_lines)

# Optional: Print output for verification
print("".join(cleaned_lines))
