import requests
import sys
import json
from datetime import datetime

class TuluAPITester:
    def __init__(self, base_url="https://0cdd5edc-d6fc-4ab7-a808-c7a77f765260.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_get_scenes(self):
        """Test getting all Turkish scenes"""
        success, response = self.run_test("Get All Scenes", "GET", "scenes", 200)
        if success and 'scenes' in response:
            scenes = response['scenes']
            print(f"   Found {len(scenes)} scenes")
            for scene in scenes:
                print(f"   - {scene.get('title', 'Unknown')} (ID: {scene.get('id', 'Unknown')})")
            return scenes
        return []

    def test_get_specific_scene(self, scene_id):
        """Test getting a specific scene"""
        success, response = self.run_test(f"Get Scene {scene_id}", "GET", f"scenes/{scene_id}", 200)
        if success:
            print(f"   Scene title: {response.get('title', 'Unknown')}")
            print(f"   Transcript lines: {len(response.get('transcript', []))}")
        return success, response

    def test_get_invalid_scene(self):
        """Test getting a non-existent scene"""
        return self.run_test("Get Invalid Scene", "GET", "scenes/invalid", 404)

    def test_get_word_meaning(self, word):
        """Test getting Turkish word meaning"""
        success, response = self.run_test(f"Get Word '{word}'", "GET", f"word/{word}", 200)
        if success:
            print(f"   Word: {response.get('word', 'Unknown')}")
            print(f"   Meaning: {response.get('meaning', 'Unknown')}")
            print(f"   Pronunciation: {response.get('pronunciation', 'Unknown')}")
        return success, response

    def test_get_invalid_word(self):
        """Test getting a non-existent word"""
        return self.run_test("Get Invalid Word", "GET", "word/invalidword123", 404)

    def test_tutor_question(self, question, session_id=None):
        """Test asking the GPT tutor a question"""
        data = {"question": question}
        if session_id:
            data["session_id"] = session_id
            
        success, response = self.run_test("Ask Tutor Question", "POST", "tutor", 200, data, timeout=60)
        if success:
            print(f"   Question: {question}")
            print(f"   Answer: {response.get('answer', 'No answer')[:100]}...")
            print(f"   Session ID: {response.get('session_id', 'Unknown')}")
            return response.get('session_id'), response.get('answer')
        return None, None

    def test_tutor_history(self, session_id):
        """Test getting tutor chat history"""
        success, response = self.run_test("Get Tutor History", "GET", f"tutor/history/{session_id}", 200)
        if success:
            messages = response.get('messages', [])
            print(f"   Found {len(messages)} messages in history")
        return success, response

def main():
    print("🇹🇷 Starting Tulu API Tests...")
    print("=" * 50)
    
    # Setup
    tester = TuluAPITester()
    
    # Test 1: Root endpoint
    tester.test_root_endpoint()
    
    # Test 2: Get all scenes
    scenes = tester.test_get_scenes()
    
    # Test 3: Get specific scenes
    if scenes:
        for scene in scenes[:2]:  # Test first 2 scenes
            tester.test_get_specific_scene(scene['id'])
    
    # Test 4: Get invalid scene
    tester.test_get_invalid_scene()
    
    # Test 5: Test Turkish words
    turkish_words = ['merhaba', 'günaydın', 'teşekkür', 'evet', 'güzel']
    for word in turkish_words:
        tester.test_get_word_meaning(word)
    
    # Test 6: Test invalid word
    tester.test_get_invalid_word()
    
    # Test 7: Test GPT Tutor (MOST IMPORTANT)
    print("\n🤖 Testing GPT Tutor Integration (CRITICAL)...")
    session_id, answer = tester.test_tutor_question("What does 'merhaba' mean in Turkish?")
    
    if session_id:
        # Test follow-up question with same session
        tester.test_tutor_question("How do you pronounce it?", session_id)
        
        # Test chat history
        tester.test_tutor_history(session_id)
    
    # Test 8: Test more complex tutor questions
    tester.test_tutor_question("Explain Turkish sentence structure")
    tester.test_tutor_question("What's the difference between 'var' and 'yok'?")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("⚠️  SOME TESTS FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(main())