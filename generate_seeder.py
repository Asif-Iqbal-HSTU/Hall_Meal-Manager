import re

mapping = {
    "1": ["গরুর মাংস", "Beef"],
    "2": ["খাসির মাংস", "Mutton"],
    "3": ["পাকিস্তানী মুরগী জীবিত", "Pakistani Chicken Alive"],
    "4": ["পাকিস্তানী মুরগী হাইব্রীড", "Pakistani Chicken Hybrid"],
    "5": ["ব্রয়লার মুরগী জীবিত", "Broiler Chicken Alive"],
    "6": ["ডিম", "Egg"],
    "7": ["২৮ নং চাল", "Rice 28"],
    "8": ["খিচুড়ির চাল", "Khichuri Rice"],
    "9": ["চিনি গুড়া পোলাও চাল", "Chinigura Polao Rice"],
    "10": ["আটা", "Flour"],
    "11": ["তৈল", "Oil"],
    "12": ["মসুর ডাল", "Lentil"],
    "13": ["বুটের ডাল", "Chickpeas Dal"],
    "14": ["মুগ ডাল/খেসারী", "Mung Dal / Khesari"],
    "15": ["চিনি", "Sugar"],
    "16": ["নুডুলস", "Noodles"],
    "17": ["কলা", "Banana"],
    "18": ["পিঁয়াজ দেশী", "Local Onion"],
    "19": ["কাঁচা মরিচ", "Green Chili"],
    "20": ["আলু", "Potato"],
    "21": ["বেগুন", "Eggplant"],
    "22": ["টমেটো", "Tomato"],
    "23": ["পেঁপে কাঁচা", "Papaya Green"],
    "24": ["ঢেঁড়শ", "Okra"],
    "25": ["পটল", "Pointed Gourd"],
    "26": ["গাজর", "Carrot"],
    "27": ["চাল কুমড়া", "Ash Gourd"],
    "28": ["লাউ", "Bottle Gourd"],
    "29": ["সবুজ/লাল শাক", "Green/Red Spinach"],
    "30": ["কলমি/পালং শাক", "Water/Spinach"],
    "31": ["পুই শাক", "Malabar Spinach"],
    "32": ["সিম", "Flat Bean"],
    "33": ["ফুলকপি", "Cauliflower"],
    "34": ["বাধাকপি", "Cabbage"],
    "35": ["শসা", "Cucumber"],
    "36": ["লেবু", "Lemon"],
    "37": ["লবণ", "Salt"],
    "38": ["আদা", "Ginger"],
    "39": ["রসুন", "Garlic"],
    "40": ["গুড়া হলুদ", "Turmeric Powder"],
    "41": ["গুড়া মরিচ", "Chili Powder"],
    "42": ["শুকনা মরিচ", "Dry Chili"],
    "43": ["সরিষার তৈল", "Mustard Oil"],
    "44": ["ছোট এলাচ", "Small Cardamom"],
    "45": ["বড় এলাচ", "Large Cardamom"],
    "46": ["লবঙ্গ", "Cloves"],
    "47": ["জিরা", "Cumin"],
    "48": ["দারুচিনি", "Cinnamon"],
    "49": ["তেজ পাতা", "Bay Leaf"],
    "50": ["জয়ফল", "Nutmeg"],
    "51": ["জয়ত্রী", "Mace"],
    "52": ["পাঁচফোড়ন", "Panch Phoron"],
    "53": ["কিসমিস", "Raisins"],
    "54": ["বাদাম", "Nut"],
    "55": ["আলু বোখারা", "Alu Bukhara / Plum"],
    "56": ["গুড়াদুধ", "Milk Powder"],
    "57": ["টমেটো সস", "Tomato Sauce"],
    "58": ["টক দই", "Sour Yogurt"],
    "59": ["বিরিয়ানী মশলা", "Biryani Masala"],
    "60": ["ঘি", "Ghee"],
    "61": ["গোল মরিচ কালো", "Black Pepper"],
    "62": ["গোল মরিচ সাদা", "White Pepper"],
    "63": ["খেজুর ডাবাস", "Dates Dabas"],
    "64": ["খেজুর বস্তা", "Dates Sack"],
    "65": ["খেজুর সাফাবি", "Dates Safawi"],
    "66": ["খেজুর ডাবাস ১ নং", "Dates Dabas No 1"],
    "67": ["আপেল", "Apple"],
    "68": ["পেয়ারা", "Guava"],
    "69": ["তরমুজ", "Watermelon"],
    "70": ["বুন্দিয়া", "Bundi"],
    "71": ["জিলাপি শাহী", "Jilapi Shahi"],
    "72": ["কলা মালভোগ", "Banana Malbhog"],
    "73": ["মাল্টা", "Malta"],
    "74": ["মুড়ি", "Puffed Rice"]
}

seed_data = []

with open("pdf_extracted.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        match = re.match(r"^(\d+)\.\s+(.*)", line)
        if match:
            idx = match.group(1)
            rest = match.group(2)
            
            # Find the unit and price at the end
            # Typically it ends with the price string, but occasionally has a dash '-' 
            # E.g. "cÖwZ †KwR  660" (Per kg 660)
            
            price_match = re.search(r"(\d+(?:\.\d+)?|\-)\s*$", rest)
            price_val = "null"
            if price_match:
                price_str = price_match.group(1)
                if price_str != "-":
                    price_val = price_str
            
            if idx in mapping:
                bn, en = mapping[idx]
                seed_data.append(f"""            [
                'name_bn' => '{bn}',
                'name_en' => '{en}',
                'unit' => null,
                'unit_price' => {price_val},
                'hall_name' => 'Shaheed Dr. Zikrul Haque Hall',
                'created_at' => now(),
                'updated_at' => now(),
            ],""")

seeder_content = f"""<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{{
    public function run(): void
    {{
        DB::table('products')->insert([
{chr(10).join(seed_data)}
        ]);
    }}
}}
"""

with open(r"c:\inetpub\wwwroot\Hall_Meal-Manager\database\seeders\ProductSeeder.php", "w", encoding="utf-8") as f:
    f.write(seeder_content)

print("Generated ProductSeeder.php")
