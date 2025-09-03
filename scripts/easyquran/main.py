import requests
import time
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, db as admin_db

# Load environment variables
load_dotenv()

# ------------------ TRANSLATION CONFIGURATIONS ------------------
TRANSLATIONS = {
    "english": {
        "131": {"name": "Dr. Mustafa Khattab, The Clear Quran", "author": "Dr. Mustafa Khattab"},
        "20": {"name": "Saheeh International", "author": "Saheeh International"},
        "109": {"name": "The Monotheist Group", "author": "The Monotheist Group"},
        "22": {"name": "Pickthall", "author": "Marmaduke Pickthall"}
    },
    "bengali": {
        "161": {"name": "Taisirul Quran", "author": "Taisirul Quran"},
        "163": {"name": "Sheikh Mujibur Rahman", "author": "Sheikh Mujibur Rahman"},
        "164": {"name": "Rawai Al-bayan", "author": "Rawai Al-bayan"},
        "162": {"name": "Dr. Abu Bakr Muhammad Zakaria", "author": "Dr. Abu Bakr Muhammad Zakaria"}
    }
}

# Default translations to fetch - including Saheeh International
DEFAULT_ENGLISH_IDS = ["20", "131", "109", "22"]  # Saheeh International first, then others
DEFAULT_BENGALI_IDS = ["161", "163", "164", "162"]  # All available Bengali translations

# ------------------ FIREBASE CONFIG ------------------
def initialize_firebase_admin():
    try:
        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', './firebase-service-account.json')
        database_url = os.getenv('FIREBASE_DATABASE_URL', 'https://wechainless-default-rtdb.asia-southeast1.firebasedatabase.app')
        
        if not os.path.exists(service_account_path):
            print(f"❌ Service account file not found: {service_account_path}")
            return None
            
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': database_url
        })
        print("✅ Firebase Admin SDK initialized successfully")
        return admin_db
    except Exception as e:
        print(f"❌ Firebase Admin SDK initialization failed: {e}")
        return None

# Initialize Firebase
print("🔥 Initializing Firebase...")
db = initialize_firebase_admin()

if not db:
    print("💥 Failed to initialize Firebase. Exiting...")
    exit(1)

# ------------------ QURAN.COM API ------------------
BASE_URL = "https://api.qurancdn.com/api/qdc"

def fetch_chapters():
    """Fetch all surah metadata."""
    print("📖 Fetching chapters from Quran API...")
    res = requests.get(f"{BASE_URL}/chapters?language=en")
    res.raise_for_status()
    chapters = res.json()["chapters"]
    print(f"✅ Successfully fetched {len(chapters)} chapters")
    return chapters

def fetch_arabic_verses(chapter_id):
    """Fetch Arabic verses with transliteration."""
    print(f"  📜 Fetching Arabic verses for chapter {chapter_id}...")
    url = f"{BASE_URL}/verses/by_chapter/{chapter_id}?words=true&per_page=300&fields=text_uthmani,text_imlaei"
    res = requests.get(url)
    res.raise_for_status()
    verses = res.json()["verses"]
    print(f"  ✅ Fetched {len(verses)} Arabic verses")
    
    # API rate limiting
    time.sleep(0.5)
    return verses

def fetch_transliteration(chapter_id):
    """Fetch transliteration for verses."""
    print(f"  📜 Fetching transliteration for chapter {chapter_id}...")
    url = f"{BASE_URL}/verses/by_chapter/{chapter_id}?fields=text_imlaei_simple&per_page=300"
    res = requests.get(url)
    res.raise_for_status()
    verses = res.json()["verses"]
    print(f"  ✅ Fetched transliteration for {len(verses)} verses")
    
    # API rate limiting
    time.sleep(0.5)
    return verses

def fetch_translations(chapter_id, translation_ids):
    """Fetch translations for given translation IDs."""
    translations_str = ",".join(translation_ids)
    print(f"  📜 Fetching translations for chapter {chapter_id} (IDs: {translations_str})...")
    url = f"{BASE_URL}/verses/by_chapter/{chapter_id}?translations={translations_str}&per_page=300"
    res = requests.get(url)
    res.raise_for_status()
    verses = res.json()["verses"]
    print(f"  ✅ Fetched translations for {len(verses)} verses")
    
    # API rate limiting
    time.sleep(0.5)
    return verses

def organize_translations(verses, translation_ids, language_key):
    """Organize translations by verse number and translation ID."""
    organized = {}
    
    for verse in verses:
        verse_number = verse["verse_number"]
        organized[verse_number] = {}
        
        if "translations" in verse:
            for i, translation in enumerate(verse["translations"]):
                if i < len(translation_ids):
                    translation_id = translation_ids[i]
                    translation_info = TRANSLATIONS[language_key].get(translation_id, {})
                    organized[verse_number][translation_id] = {
                        "text": translation.get("text", ""),
                        "author": translation_info.get("author", "Unknown"),
                        "name": translation_info.get("name", "Unknown Translation")
                    }
    
    return organized

def clear_database():
    """Clear the entire quran database before fresh upload."""
    try:
        print("🗑️  Clearing existing Quran database...")
        ref = db.reference('quran')
        ref.delete()
        print("✅ Database cleared successfully")
        return True
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        return False

def upload_to_firebase(chapter_id, surah_data):
    """Upload surah data to Firebase with proper error handling."""
    try:
        ref = db.reference(f'quran/{chapter_id}')
        ref.set(surah_data)
        return True
    except Exception as e:
        print(f"     Firebase Error: {str(e)}")
        return False

# ------------------ MAIN UPLOAD FUNCTION ------------------
def upload_quran():
    print("🚀 Starting comprehensive Quran upload process...\n")
    print("📋 Configuration:")
    print(f"   English Translations: {len(DEFAULT_ENGLISH_IDS)} - {DEFAULT_ENGLISH_IDS}")
    print(f"   Bengali Translations: {len(DEFAULT_BENGALI_IDS)} - {DEFAULT_BENGALI_IDS}")
    print(f"   Primary Translation: Saheeh International (ID: 20)")
    
    # Clear existing database
    if not clear_database():
        print("💥 Failed to clear database. Exiting...")
        return
    
    print("\n" + "="*80)
    print("🔄 STARTING FRESH UPLOAD WITH ALL LANGUAGES")
    print("="*80)
    
    try:
        chapters = fetch_chapters()
        print(f"\n📊 Total chapters to process: {len(chapters)}")
        
        # Calculate total expected verses
        total_expected_verses = sum(chapter['verses_count'] for chapter in chapters)
        print(f"📊 Total expected verses: {total_expected_verses}")
        print("\n")

        total_uploaded_verses = 0
        failed_chapters = []
        start_time = time.time()

        for idx, chapter in enumerate(chapters, 1):
            chapter_start_time = time.time()
            print(f"{'='*80}")
            print(f"📋 Processing Surah {chapter['id']}/{len(chapters)}: {chapter['name_simple']}")
            print(f"   Arabic Name: {chapter['name_arabic']}")
            print(f"   Translation: {chapter['translated_name']['name']}")
            print(f"   Total Verses: {chapter['verses_count']}")
            print(f"   📈 Overall Progress: {idx}/{len(chapters)} ({idx/len(chapters)*100:.1f}%)")
            print(f"{'='*80}")

            try:
                # Fetch Arabic verses
                arabic_verses = fetch_arabic_verses(chapter["id"])
                
                # Fetch transliteration
                transliteration_verses = fetch_transliteration(chapter["id"])
                
                # Fetch English translations (including Saheeh International)
                english_verses = fetch_translations(chapter["id"], DEFAULT_ENGLISH_IDS)
                english_translations = organize_translations(english_verses, DEFAULT_ENGLISH_IDS, "english")
                
                # Fetch Bengali translations
                bengali_verses = fetch_translations(chapter["id"], DEFAULT_BENGALI_IDS)
                bengali_translations = organize_translations(bengali_verses, DEFAULT_BENGALI_IDS, "bengali")
                
                print(f"  📊 Data Summary:")
                print(f"     ✅ Arabic verses: {len(arabic_verses)}")
                print(f"     ✅ Transliteration: {len(transliteration_verses)}")
                print(f"     ✅ English translations: {len(DEFAULT_ENGLISH_IDS)} types")
                print(f"     ✅ Bengali translations: {len(DEFAULT_BENGALI_IDS)} types")

            except Exception as e:
                print(f"  ❌ Error fetching verses: {e}")
                failed_chapters.append(chapter['id'])
                continue

            # Prepare surah data structure
            print(f"  🔧 Preparing comprehensive data structure...")
            surah_data = {
                "metadata": {
                    "id": chapter["id"],
                    "name_arabic": chapter["name_arabic"],
                    "name_simple": chapter["name_simple"],
                    "name_translation": chapter["translated_name"]["name"],
                    "total_verses": chapter["verses_count"],
                    "revelation_place": chapter.get("revelation_place", ""),
                    "revelation_order": chapter.get("revelation_order", 0),
                    "uploaded_at": int(time.time())
                },
                "translations_info": {
                    "english": TRANSLATIONS["english"],
                    "bengali": TRANSLATIONS["bengali"]
                },
                "verses": {}
            }

            # Process each verse
            processed_verses = 0
            for i, arabic_verse in enumerate(arabic_verses):
                verse_number = arabic_verse["verse_number"]
                
                # Get transliteration for this verse
                transliteration = ""
                if i < len(transliteration_verses):
                    transliteration = transliteration_verses[i].get("text_imlaei_simple", "")
                
                # Build verse data
                verse_data = {
                    "arabic": {
                        "text_uthmani": arabic_verse.get("text_uthmani", ""),
                        "text_imlaei": arabic_verse.get("text_imlaei", "")
                    },
                    "transliteration": transliteration,
                    "translations": {
                        "english": english_translations.get(verse_number, {}),
                        "bengali": bengali_translations.get(verse_number, {})
                    }
                }
                
                surah_data["verses"][str(verse_number)] = verse_data
                processed_verses += 1
            
            print(f"  ✅ Processed {processed_verses} verses with complete translation data")

            # Upload surah to Firebase
            try:
                print(f"  🔄 Uploading to Firebase...")
                success = upload_to_firebase(chapter["id"], surah_data)
                if success:
                    total_uploaded_verses += processed_verses
                    chapter_time = time.time() - chapter_start_time
                    print(f"  ✅ Successfully uploaded Surah {chapter['id']} to Firebase ({chapter_time:.1f}s)")
                    
                    # Show sample data for first verse with Saheeh International
                    if "1" in surah_data["verses"]:
                        sample_verse = surah_data["verses"]["1"]
                        print(f"  📝 Sample verse 1:")
                        print(f"     Arabic: {sample_verse['arabic']['text_uthmani'][:60]}...")
                        print(f"     Transliteration: {sample_verse['transliteration'][:60]}...")
                        
                        # Show Saheeh International first
                        if "20" in sample_verse['translations']['english']:
                            saheeh_text = sample_verse['translations']['english']['20']['text']
                            print(f"     Saheeh International: {saheeh_text[:60]}...")
                        
                        # Show other English translations
                        if sample_verse['translations']['english']:
                            other_eng = [k for k in sample_verse['translations']['english'].keys() if k != "20"]
                            if other_eng:
                                first_other = sample_verse['translations']['english'][other_eng[0]]
                                print(f"     Other English: {first_other['text'][:60]}...")
                        
                        # Show Bengali translation
                        if sample_verse['translations']['bengali']:
                            first_ben = list(sample_verse['translations']['bengali'].values())[0]
                            print(f"     Bengali: {first_ben['text'][:60]}...")
                else:
                    print(f"  ❌ Failed to upload Surah {chapter['id']}")
                    failed_chapters.append(chapter['id'])
                    continue
                
            except Exception as e:
                print(f"  ❌ Firebase upload failed: {e}")
                failed_chapters.append(chapter['id'])
                continue

            # Enhanced progress reporting
            elapsed_time = time.time() - start_time
            avg_time_per_chapter = elapsed_time / idx
            estimated_remaining = (len(chapters) - idx) * avg_time_per_chapter
            
            print(f"  📊 Status Report:")
            print(f"     ⏱️  Chapter processed in: {chapter_time:.1f}s")
            print(f"     📈 Verses uploaded so far: {total_uploaded_verses}/{total_expected_verses}")
            print(f"     ⏳ Elapsed time: {elapsed_time/60:.1f} minutes")
            print(f"     🔮 Estimated remaining: {estimated_remaining/60:.1f} minutes")

            print(f"  ⏱️  Waiting 3 seconds before next chapter (API rate limiting)...")
            time.sleep(3)  # Increased delay to respect API limits
            
            print(f"  📈 Overall Progress: {idx}/{len(chapters)} chapters completed ({idx/len(chapters)*100:.1f}%)")
            print(f"     ✅ Successful uploads: {idx - len(failed_chapters)}")
            print(f"     ❌ Failed uploads: {len(failed_chapters)}")
            print()

        # Final summary
        total_time = time.time() - start_time
        print("🎉 Comprehensive Quran upload process completed!")
        print(f"\n📋 Final Summary:")
        print(f"{'='*60}")
        print(f"📊 Statistics:")
        print(f"   Total chapters processed: {len(chapters)}")
        print(f"   Successful uploads: {len(chapters) - len(failed_chapters)}")
        print(f"   Failed uploads: {len(failed_chapters)}")
        print(f"   Total verses uploaded: {total_uploaded_verses}")
        print(f"   Total processing time: {total_time/60:.1f} minutes")
        print(f"   Average time per chapter: {total_time/len(chapters):.1f} seconds")
        
        print(f"\n🌍 Languages Included:")
        print(f"English Translations:")
        for tid in DEFAULT_ENGLISH_IDS:
            info = TRANSLATIONS["english"][tid]
            status = "🥇 PRIMARY" if tid == "20" else "✅"
            print(f"  {status} {info['name']} (ID: {tid})")
        print(f"Bengali Translations:")
        for tid in DEFAULT_BENGALI_IDS:
            info = TRANSLATIONS["bengali"][tid]
            print(f"  ✅ {info['name']} (ID: {tid})")
        
        if failed_chapters:
            print(f"\n❌ Failed Chapters: {failed_chapters}")
        else:
            print(f"\n🎯 All chapters uploaded successfully!")
        
    except Exception as e:
        print(f"💥 Fatal error during upload process: {e}")

def add_translation(language, translation_id, name, author):
    """Helper function to add new translations to the configuration."""
    if language not in TRANSLATIONS:
        TRANSLATIONS[language] = {}
    
    TRANSLATIONS[language][translation_id] = {
        "name": name,
        "author": author
    }
    print(f"✅ Added {language} translation: {name} (ID: {translation_id})")

if __name__ == "__main__":
    # Example of how to add more translations before upload:
    # add_translation("english", "85", "Ali Quli Qarai", "Ali Quli Qarai")
    # add_translation("bengali", "165", "New Bengali Translation", "New Author")
    
    upload_quran()
