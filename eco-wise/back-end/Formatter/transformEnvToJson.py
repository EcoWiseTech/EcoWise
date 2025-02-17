import json

def transform_file_to_json(input_file, output_file):
    try:
        # Read the input file
        with open(input_file, "r", encoding="utf-8") as file:
            lines = file.read().strip().split("\n")
        
        # Process key-value pairs
        result_dict = {}
        for i in range(0, len(lines), 2):
            key = lines[i].strip()
            value = lines[i + 1].strip()
            result_dict[key] = value
        
        # Write the output as a JSON file
        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(result_dict, json_file, indent=2)

        print(f"JSON output has been saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")

# Specify file paths
input_file = "input.txt"
output_file = "output.json"

# Transform input file to JSON
transform_file_to_json(input_file, output_file)
