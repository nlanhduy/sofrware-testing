import requests
import csv
import time
import random
from urllib.parse import urlparse

# API Configuration
API_KEY = '51F2YMORuXxX0tltcGWS8hZTSExLqYZQ9SXBi3Hj5Ym4jwaWpY6OJYHy'
HEADERS = {'Authorization': API_KEY}
BASE_URL = 'https://api.pexels.com/v1/search'

# Extended keyword list with detailed information for rich file names and titles
keywords_data = {
    # Basic handheld tools
    'hammer': {
        'variations': ['Claw hammer', 'Ball peen hammer', 'Sledgehammer', 'Rubber mallet', 'Framing hammer'],
        'file_names': ['claw_hammer', 'ball_peen', 'sledgehammer', 'rubber_mallet', 'framing_hammer']
    },
    'screwdriver': {
        'variations': ['Phillips screwdriver', 'Flathead screwdriver', 'Torx screwdriver', 'Precision screwdriver', 'Electric screwdriver'],
        'file_names': ['phillips_driver', 'flathead_driver', 'torx_driver', 'precision_driver', 'electric_driver']
    },
    'wrench': {
        'variations': ['Adjustable wrench', 'Combination wrench', 'Open-end wrench', 'Box-end wrench', 'Pipe wrench'],
        'file_names': ['adjustable_wrench', 'combination_wrench', 'open_end_wrench', 'box_end_wrench', 'pipe_wrench']
    },
    'pliers': {
        'variations': ['Needle-nose pliers', 'Wire cutters', 'Locking pliers', 'Combination pliers', 'Diagonal pliers'],
        'file_names': ['needle_nose', 'wire_cutters', 'locking_pliers', 'combination_pliers', 'diagonal_pliers']
    },
    'chisel': {
        'variations': ['Wood chisel', 'Cold chisel', 'Masonry chisel', 'Mortise chisel', 'Carving chisel'],
        'file_names': ['wood_chisel', 'cold_chisel', 'masonry_chisel', 'mortise_chisel', 'carving_chisel']
    },
    'file tool': {
        'variations': ['Metal file', 'Wood file', 'Bastard file', 'Smooth file', 'Round file'],
        'file_names': ['metal_file', 'wood_file', 'bastard_file', 'smooth_file', 'round_file']
    },
    
    # Measuring tools
    'tape measure': {
        'variations': ['Steel tape measure', 'Retractable tape', 'Construction tape', 'Metric tape measure', 'Digital tape measure'],
        'file_names': ['steel_tape', 'retractable_tape', 'construction_tape', 'metric_tape', 'digital_tape']
    },
    'ruler': {
        'variations': ['Steel ruler', 'Wooden ruler', 'Folding ruler', 'Architect scale', 'Triangular ruler'],
        'file_names': ['steel_ruler', 'wooden_ruler', 'folding_ruler', 'architect_scale', 'triangular_ruler']
    },
    'level tool': {
        'variations': ['Spirit level', 'Bubble level', 'Laser level', 'Torpedo level', 'Box beam level'],
        'file_names': ['spirit_level', 'bubble_level', 'laser_level', 'torpedo_level', 'box_beam_level']
    },
    'caliper': {
        'variations': ['Digital caliper', 'Vernier caliper', 'Dial caliper', 'Inside caliper', 'Outside caliper'],
        'file_names': ['digital_caliper', 'vernier_caliper', 'dial_caliper', 'inside_caliper', 'outside_caliper']
    },
    
    # Cutting tools
    'saw': {
        'variations': ['Hand saw', 'Crosscut saw', 'Rip saw', 'Back saw', 'Coping saw'],
        'file_names': ['hand_saw', 'crosscut_saw', 'rip_saw', 'back_saw', 'coping_saw']
    },
    'hacksaw': {
        'variations': ['Metal hacksaw', 'Mini hacksaw', 'Adjustable hacksaw', 'Junior hacksaw', 'Heavy duty hacksaw'],
        'file_names': ['metal_hacksaw', 'mini_hacksaw', 'adjustable_hacksaw', 'junior_hacksaw', 'heavy_duty_hacksaw']
    },
    'jigsaw': {
        'variations': ['Cordless jigsaw', 'Orbital jigsaw', 'Barrel grip jigsaw', 'Top handle jigsaw', 'Precision jigsaw'],
        'file_names': ['cordless_jigsaw', 'orbital_jigsaw', 'barrel_grip_jigsaw', 'top_handle_jigsaw', 'precision_jigsaw']
    },
    'circular saw': {
        'variations': ['Portable circular saw', 'Table saw blade', 'Cordless circular saw', 'Mini circular saw', 'Track saw'],
        'file_names': ['portable_circular', 'table_saw_blade', 'cordless_circular', 'mini_circular', 'track_saw']
    },
    
    # Power tools
    'drill': {
        'variations': ['Cordless drill', 'Hammer drill', 'Impact drill', 'Drill press', 'Right angle drill'],
        'file_names': ['cordless_drill', 'hammer_drill', 'impact_drill', 'drill_press', 'right_angle_drill']
    },
    'electric drill': {
        'variations': ['Corded drill', 'High torque drill', 'Variable speed drill', 'Reversible drill', 'Professional drill'],
        'file_names': ['corded_drill', 'high_torque_drill', 'variable_speed_drill', 'reversible_drill', 'professional_drill']
    },
    
    # Tool sets
    'toolbox': {
        'variations': ['Portable toolbox', 'Rolling tool chest', 'Tool cabinet', 'Tool bag', 'Mechanics toolbox'],
        'file_names': ['portable_toolbox', 'rolling_chest', 'tool_cabinet', 'tool_bag', 'mechanics_box']
    },
    'tool set': {
        'variations': ['Socket set', 'Screwdriver set', 'Hex key set', 'Wrench set', 'Complete tool set'],
        'file_names': ['socket_set', 'screwdriver_set', 'hex_key_set', 'wrench_set', 'complete_tool_set']
    },
    
    # Specialized tools
    'utility knife': {
        'variations': ['Retractable utility knife', 'Box cutter', 'Snap-off knife', 'Fixed blade knife', 'Safety knife'],
        'file_names': ['retractable_knife', 'box_cutter', 'snap_off_knife', 'fixed_blade', 'safety_knife']
    },
    'multimeter': {
        'variations': ['Digital multimeter', 'Analog multimeter', 'Clamp meter', 'Auto-ranging meter', 'Professional multimeter'],
        'file_names': ['digital_multimeter', 'analog_multimeter', 'clamp_meter', 'auto_ranging', 'professional_meter']
    },
    'flashlight': {
        'variations': ['LED flashlight', 'Tactical flashlight', 'Headlamp', 'Work light', 'Rechargeable flashlight'],
        'file_names': ['led_flashlight', 'tactical_flashlight', 'headlamp', 'work_light', 'rechargeable_flashlight']
    },
    
    # Garden tools
    'shovel': {
        'variations': ['Spade shovel', 'Garden spade', 'Trenching shovel', 'Folding shovel', 'Snow shovel'],
        'file_names': ['spade_shovel', 'garden_spade', 'trenching_shovel', 'folding_shovel', 'snow_shovel']
    },
    'rake': {
        'variations': ['Leaf rake', 'Garden rake', 'Bow rake', 'Thatch rake', 'Mini rake'],
        'file_names': ['leaf_rake', 'garden_rake', 'bow_rake', 'thatch_rake', 'mini_rake']
    },
    
    # Painting tools
    'paint brush': {
        'variations': ['Angled brush', 'Flat brush', 'Round brush', 'Foam brush', 'Detail brush'],
        'file_names': ['angled_brush', 'flat_brush', 'round_brush', 'foam_brush', 'detail_brush']
    },
    'paint roller': {
        'variations': ['Paint roller frame', 'Foam roller', 'Microfiber roller', 'Textured roller', 'Mini roller'],
        'file_names': ['roller_frame', 'foam_roller', 'microfiber_roller', 'textured_roller', 'mini_roller']
    },
    
    # Safety equipment
    'safety goggles': {
        'variations': ['Safety glasses', 'Protective eyewear', 'Splash goggles', 'Welding goggles', 'Anti-fog goggles'],
        'file_names': ['safety_glasses', 'protective_eyewear', 'splash_goggles', 'welding_goggles', 'anti_fog_goggles']
    },
    'work gloves': {
        'variations': ['Leather work gloves', 'Cut resistant gloves', 'Nitrile gloves', 'Mechanics gloves', 'Insulated gloves'],
        'file_names': ['leather_gloves', 'cut_resistant', 'nitrile_gloves', 'mechanics_gloves', 'insulated_gloves']
    },
    'hard hat': {
        'variations': ['Construction helmet', 'Safety helmet', 'Hard hat with visor', 'Ventilated hard hat', 'Electrical hard hat'],
        'file_names': ['construction_helmet', 'safety_helmet', 'hard_hat_visor', 'ventilated_hard_hat', 'electrical_hard_hat']
    }
}

keywords = list(keywords_data.keys())

def generate_file_title(keyword, photo_index, total_for_keyword):
    if keyword in keywords_data:
        variations = keywords_data[keyword]['variations']
        file_names = keywords_data[keyword]['file_names']
        
        variation_index = photo_index % len(variations)
        variation = variations[variation_index]
        file_name_base = file_names[variation_index]
        
        file_name = f"{file_name_base}{(photo_index // len(variations)) + 1:02d}.jpg"
        
        return file_name, variation
    else:
        clean_keyword = keyword.replace(' ', '_').lower()
        file_name = f"{clean_keyword}{photo_index + 1:02d}.jpg"
        title = f"{keyword.title()} tool"
        return file_name, title

output_data = []
used_urls = set()
keyword_counters = {}

print(f"Starting data collection from {len(keywords)} keywords...")

for keyword_index, keyword in enumerate(keywords):
    if len(output_data) >= 500:
        break
    
    print(f"Processing keyword '{keyword}' ({keyword_index + 1}/{len(keywords)})")
    
    max_pages = min(3, (500 - len(output_data)) // 10 + 1)
    
    for page in range(1, max_pages + 1):
        if len(output_data) >= 500:
            break
        
        try:
            response = requests.get(BASE_URL, headers=HEADERS, params={
                'query': keyword,
                'per_page': 20,
                'page': page
            })
            
            if response.status_code != 200:
                print(f"API Error: keyword='{keyword}' page={page} - Status: {response.status_code}")
                continue
            
            data = response.json()
            photos = data.get('photos', [])
            
            if not photos:
                print(f"No photos found for keyword '{keyword}' page {page}")
                break
            
            for photo in photos:
                if len(output_data) >= 500:
                    break
                
                original_url = photo['src'].get('original')
                
                if original_url in used_urls:
                    continue
                
                used_urls.add(original_url)
                
                if keyword not in keyword_counters:
                    keyword_counters[keyword] = 0
                
                file_name, title = generate_file_title(keyword, keyword_counters[keyword], len(photos))
                keyword_counters[keyword] += 1
                
                output_data.append({
                    'by_name': photo.get('photographer', 'Unknown'),
                    'by_url': photo.get('photographer_url', ''),
                    'source_name': 'Pexels',
                    'source_url': original_url,
                    'file_name': file_name,
                    'title': title
                })
            
            time.sleep(0.1)
            
        except Exception as e:
            print(f"Error processing keyword '{keyword}' page {page}: {str(e)}")
            continue
    
    print(f"Completed '{keyword}' - Total images: {len(output_data)}")

# Write data to CSV file
csv_filename = 'product_images_tools.csv'
try:
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['by_name', 'by_url', 'source_name', 'source_url', 'file_name', 'title']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(output_data)
    
    print(f"\nCOMPLETED!")
    print(f"Created file '{csv_filename}' with {len(output_data)} rows of data")
    print(f"Removed {len(used_urls) - len(output_data)} duplicate images")

except Exception as e:
    print(f"Error writing CSV file: {str(e)}")