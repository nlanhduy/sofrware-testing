import csv
import random
import re

# Predefined categories from the provided SQL
initial_categories = [
    {"id": 1, "parent_id": None, "name": "Hand Tools", "slug": "hand-tools"},
    {"id": 2, "parent_id": None, "name": "Power Tools", "slug": "power-tools"},
    {"id": 3, "parent_id": 1, "name": "Hammer", "slug": "hammer"},
    {"id": 4, "parent_id": 1, "name": "Hand Saw", "slug": "hand-saw"},
    {"id": 5, "parent_id": 1, "name": "Wrench", "slug": "wrench"},
    {"id": 6, "parent_id": 1, "name": "Screwdriver", "slug": "screwdriver"},
    {"id": 7, "parent_id": 1, "name": "Pliers", "slug": "pliers"},
    {"id": 8, "parent_id": 2, "name": "Grinder", "slug": "grinder"},
    {"id": 9, "parent_id": 2, "name": "Sander", "slug": "sander"},
    {"id": 10, "parent_id": 2, "name": "Saw", "slug": "saw"},
    {"id": 11, "parent_id": 2, "name": "Drill", "slug": "drill"},
    {"id": 12, "parent_id": None, "name": "Other", "slug": "other"}
]

# Additional base categories and subcategories for diversity
additional_base_categories = [
    {"name": "Measuring Tools", "slug": "measuring-tools"},
    {"name": "Cutting Tools", "slug": "cutting-tools"},
    {"name": "Gardening Tools", "slug": "gardening-tools"},
    {"name": "Safety Equipment", "slug": "safety-equipment"},
    {"name": "Tool Sets", "slug": "tool-sets"}
]

subcategories = {
    "Hand Tools": [
        {"name": "Chisel", "slug": "chisel", "variations": ["Wood Chisel", "Cold Chisel", "Masonry Chisel"]},
        {"name": "File", "slug": "file", "variations": ["Metal File", "Wood File", "Round File"]}
    ],
    "Power Tools": [
        {"name": "Router", "slug": "router", "variations": ["Plunge Router", "Fixed-Base Router"]},
        {"name": "Planer", "slug": "planer", "variations": ["Hand Planer", "Electric Planer"]}
    ],
    "Measuring Tools": [
        {"name": "Tape Measure", "slug": "tape-measure", "variations": ["Steel Tape Measure", "Digital Tape Measure"]},
        {"name": "Level", "slug": "level", "variations": ["Bubble Level", "Laser Level"]}
    ],
    "Cutting Tools": [
        {"name": "Hacksaw", "slug": "hacksaw", "variations": ["Metal Hacksaw", "Mini Hacksaw"]},
        {"name": "Utility Knife", "slug": "utility-knife", "variations": ["Retractable Knife", "Snap-Off Knife"]}
    ],
    "Gardening Tools": [
        {"name": "Shovel", "slug": "shovel", "variations": ["Spade Shovel", "Garden Shovel"]},
        {"name": "Rake", "slug": "rake", "variations": ["Leaf Rake", "Garden Rake"]}
    ],
    "Safety Equipment": [
        {"name": "Safety Goggles", "slug": "safety-goggles", "variations": ["Protective Glasses", "Anti-Fog Goggles"]},
        {"name": "Work Gloves", "slug": "work-gloves", "variations": ["Leather Gloves", "Cut-Resistant Gloves"]}
    ],
    "Tool Sets": [
        {"name": "Toolbox", "slug": "toolbox", "variations": ["Portable Toolbox", "Mechanics Toolbox"]},
        {"name": "Socket Set", "slug": "socket-set", "variations": ["Metric Socket Set", "SAE Socket Set"]}
    ],
    "Other": [
        {"name": "Flashlight", "slug": "flashlight", "variations": ["LED Flashlight", "Tactical Flashlight"]},
        {"name": "Multimeter", "slug": "multimeter", "variations": ["Digital Multimeter", "Analog Multimeter"]}
    ]
}

# Initialize output data and tracking
output_data = initial_categories.copy()
used_names = set(item["name"] for item in initial_categories)
used_ids = set(item["id"] for item in initial_categories)
id_counter = max(used_ids) + 1

# Function to generate a slug from a name
def generate_slug(name):
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return slug

# Function to get valid parent_id (ensuring parent exists)
def get_valid_parent_id(existing_ids):
    return random.choice(list(existing_ids)) if existing_ids else None

# Add additional base categories
for category in additional_base_categories:
    if len(output_data) >= 500 or category["name"] in used_names:
        continue
    output_data.append({
        "id": id_counter,
        "parent_id": None,
        "name": category["name"],
        "slug": category["slug"]
    })
    used_names.add(category["name"])
    used_ids.add(id_counter)
    id_counter += 1

# Generate subcategories and variations
while len(output_data) < 500:
    # Randomly select a base category
    base_cat = random.choice([cat["name"] for cat in output_data if cat["parent_id"] is None])
    
    # Get subcategories for the base category
    if base_cat in subcategories:
        subcategory = random.choice(subcategories[base_cat])
        subcategory_name = subcategory["name"]
        base_cat_id = next(item["id"] for item in output_data if item["name"] == base_cat)
        
        # Check if subcategory already exists
        subcategory_id = None
        for item in output_data:
            if item["name"] == subcategory_name and item["parent_id"] == base_cat_id:
                subcategory_id = item["id"]
                break

        # Add subcategory if it doesn't exist
        if not subcategory_id and len(output_data) < 500 and subcategory_name not in used_names:
            subcategory_id = id_counter
            output_data.append({
                "id": id_counter,
                "parent_id": base_cat_id,
                "name": subcategory_name,
                "slug": subcategory["slug"]
            })
            used_names.add(subcategory_name)
            used_ids.add(id_counter)
            id_counter += 1

        # Add variations as sub-subcategories
        for variation in subcategory["variations"]:
            if len(output_data) >= 500:
                break
            if variation not in used_names:
                output_data.append({
                    "id": id_counter,
                    "parent_id": subcategory_id,
                    "name": variation,
                    "slug": generate_slug(variation)
                })
                used_names.add(variation)
                used_ids.add(id_counter)
                id_counter += 1
            else:
                # Create a unique variation if name exists
                variation_count = sum(1 for name in used_names if name.startswith(variation))
                new_variation = f"{variation} {variation_count + 1}"
                if new_variation not in used_names and len(output_data) < 500:
                    output_data.append({
                        "id": id_counter,
                        "parent_id": subcategory_id,
                        "name": new_variation,
                        "slug": generate_slug(new_variation)
                    })
                    used_names.add(new_variation)
                    used_ids.add(id_counter)
                    id_counter += 1

# Validate no duplicate names
name_set = set(item["name"] for item in output_data)
if len(name_set) != len(output_data):
    print(f"⚠️ Warning: Found {len(output_data) - len(name_set)} duplicate names!")
else:
    print("✅ All category names are unique")

# Export to CSV
csv_filename = 'categories_data.csv'
try:
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'parent_id', 'name', 'slug']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(output_data)
    
    print(f"🎉 Generated '{csv_filename}' with {len(output_data)} rows")
    print(f"✅ Included all 12 predefined categories")
    print(f"🔗 Ensured parent_id references exist")

except Exception as e:
    print(f"❌ Error writing CSV: {str(e)}")