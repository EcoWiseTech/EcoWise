import json

# Read JSON content from input.txt
with open("input.txt", "r") as file:
    data = json.load(file)

# Convert JSON keys to environment variable format
output_lines = [f"{key.upper()}={value}" for key, value in data.items()]

# Write the transformed content to output.txt
with open("output.txt", "w") as file:
    file.write("\n".join(output_lines))

# Optional: Print the output
print("\n".join(output_lines))
