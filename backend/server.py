from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class TurkishWord(BaseModel):
    word: str
    meaning: str
    pronunciation: str
    example: str

class TutorQuestion(BaseModel):
    question: str
    session_id: Optional[str] = None

class TutorResponse(BaseModel):
    answer: str
    session_id: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    question: str
    answer: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Dummy Turkish TV scenes data
TURKISH_SCENES = [
    {
        "id": "scene1",
        "title": "Kahvaltı - Breakfast",
        "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        "transcript": [
            {"time": 0, "text": "Günaydın!", "translation": "Good morning!"},
            {"time": 2, "text": "Kahvaltı hazır mı?", "translation": "Is breakfast ready?"},
            {"time": 4, "text": "Evet, masaya gel.", "translation": "Yes, come to the table."},
            {"time": 6, "text": "Çok güzel görünüyor.", "translation": "It looks very nice."},
            {"time": 8, "text": "Afiyet olsun!", "translation": "Enjoy your meal!"}
        ]
    },
    {
        "id": "scene2", 
        "title": "Alışveriş - Shopping",
        "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        "transcript": [
            {"time": 0, "text": "Bu ne kadar?", "translation": "How much is this?"},
            {"time": 2, "text": "Yirmi lira.", "translation": "Twenty liras."},
            {"time": 4, "text": "Biraz pahalı.", "translation": "It's a bit expensive."},
            {"time": 6, "text": "Size indirim yapabilirim.", "translation": "I can give you a discount."},
            {"time": 8, "text": "Teşekkür ederim!", "translation": "Thank you!"}
        ]
    },
    {
        "id": "scene3",
        "title": "Tanışma - Meeting",
        "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", 
        "transcript": [
            {"time": 0, "text": "Merhaba, ben Ayşe.", "translation": "Hello, I'm Ayşe."},
            {"time": 2, "text": "Benim adım Mehmet.", "translation": "My name is Mehmet."},
            {"time": 4, "text": "Tanıştığımıza memnun oldum.", "translation": "Nice to meet you."},
            {"time": 6, "text": "Ben de memnun oldum.", "translation": "Nice to meet you too."},
            {"time": 8, "text": "Görüşürüz!", "translation": "See you later!"}
        ]
    }
]

# Turkish words dictionary
TURKISH_WORDS = {
    "günaydın": {"meaning": "good morning", "pronunciation": "goo-nay-duhn", "example": "Günaydın! Nasılsın?"},
    "kahvaltı": {"meaning": "breakfast", "pronunciation": "kah-val-tuh", "example": "Kahvaltı yapmak istiyorum."},
    "merhaba": {"meaning": "hello", "pronunciation": "mer-ha-ba", "example": "Merhaba! Nasılsın?"},
    "teşekkür": {"meaning": "thank you", "pronunciation": "teh-shek-kur", "example": "Teşekkür ederim!"},
    "evet": {"meaning": "yes", "pronunciation": "eh-vet", "example": "Evet, doğru."},
    "abla": {"meaning": "older sister", "pronunciation": "ab-la", "example": "Ablam çok güzel."},
    "güzel": {"meaning": "beautiful/nice", "pronunciation": "gue-zel", "example": "Bu çok güzel!"},
    "pahalı": {"meaning": "expensive", "pronunciation": "pa-ha-luh", "example": "Bu çok pahalı."},
    "indirim": {"meaning": "discount", "pronunciation": "in-di-rim", "example": "Size indirim yapabilirim."},
    "memnun": {"meaning": "pleased/happy", "pronunciation": "mem-nun", "example": "Memnun oldum."}
}

# Routes
@api_router.get("/")
async def root():
    return {"message": "Tulu API - Turkish Learning Platform"}

@api_router.get("/scenes")
async def get_scenes():
    return {"scenes": TURKISH_SCENES}

@api_router.get("/scenes/{scene_id}")
async def get_scene(scene_id: str):
    scene = next((s for s in TURKISH_SCENES if s["id"] == scene_id), None)
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    return scene

@api_router.get("/word/{word}")
async def get_word_meaning(word: str):
    word_lower = word.lower()
    if word_lower in TURKISH_WORDS:
        return {
            "word": word,
            "meaning": TURKISH_WORDS[word_lower]["meaning"],
            "pronunciation": TURKISH_WORDS[word_lower]["pronunciation"],
            "example": TURKISH_WORDS[word_lower]["example"]
        }
    else:
        raise HTTPException(status_code=404, detail="Word not found")

@api_router.post("/tutor", response_model=TutorResponse)
async def ask_tutor(question: TutorQuestion):
    # Create a new session ID if not provided
    session_id = question.session_id or str(uuid.uuid4())
    
    # Check if we have a valid OpenAI API key first
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key or len(openai_key) < 10:
        return await provide_fallback_response(question, session_id)
    
    try:
        # Initialize the Turkish tutor chat
        chat = LlmChat(
            api_key=openai_key,
            session_id=session_id,
            system_message="""You are a Turkish language tutor named Tulu. You help users learn Turkish words, grammar, pronunciation, and provide context for Turkish language usage. 

Your characteristics:
- You are friendly, encouraging, and patient
- You provide clear explanations in English
- You focus on practical usage and cultural context
- You help with Turkish vocabulary, sentence structure, and cultural nuances
- You answer questions about Turkish TV dialogue and expressions

Always be encouraging and provide clear, helpful explanations. If someone asks about a Turkish word or phrase, explain its meaning, pronunciation, and give example usage."""
        ).with_model("openai", "gpt-4o")
        
        # Create user message
        user_message = UserMessage(text=question.question)
        
        # Get response from GPT with timeout
        response = await chat.send_message(user_message)
        
        # Save the chat to database
        chat_record = ChatMessage(
            session_id=session_id,
            question=question.question,
            answer=response
        )
        await db.chat_messages.insert_one(chat_record.dict())
        
        return TutorResponse(answer=response, session_id=session_id)
        
    except Exception as e:
        logging.error(f"Error in tutor endpoint: {str(e)}")
        return await provide_fallback_response(question, session_id)

async def provide_fallback_response(question: TutorQuestion, session_id: str):
    """Provide helpful fallback responses for Turkish learning"""
    
    # Provide a helpful fallback response for common Turkish questions
    fallback_responses = {
        "merhaba": "\"Merhaba\" means \"hello\" in Turkish. It's pronounced as [mer-HAH-bah]. You can use it in both formal and informal situations. Example: \"Merhaba, nasılsın?\" (Hello, how are you?)",
        "teşekkür": "\"Teşekkür ederim\" means \"thank you\" in Turkish. It's pronounced as [teh-shek-KOOR eh-deh-rim]. You can also say just \"teşekkürler\" for \"thanks\". Example: \"Yardımınız için teşekkür ederim.\" (Thank you for your help.)",
        "nasılsın": "\"Nasılsın?\" means \"How are you?\" in Turkish. It's pronounced as [nah-suhl-SUHN]. The response is usually \"İyiyim, teşekkürler\" (I'm fine, thank you). Example conversation: \"Merhaba, nasılsın?\" - \"İyiyim, sen nasılsın?\"",
        "günaydın": "\"Günaydın\" means \"good morning\" in Turkish. It's pronounced as [goon-ay-DUHN]. You use this greeting from morning until around noon. Example: \"Günaydın! Bugün nasılsın?\" (Good morning! How are you today?)",
        "abla": "\"Abla\" means \"older sister\" in Turkish, but it's also used to respectfully address any woman who is older than you. Pronounced as [ah-BLAH]. Example: \"Abla, yardım edebilir misiniz?\" (Sister/Ma'am, can you help me?)",
        "hello": "To say \"hello\" in Turkish, you say \"Merhaba\" [mer-HAH-bah]. It's the most common greeting used any time of day!",
        "thank you": "To say \"thank you\" in Turkish, you say \"Teşekkür ederim\" [teh-shek-KOOR eh-deh-rim] or simply \"Teşekkürler\" [teh-shek-kur-LER].",
        "good morning": "\"Good morning\" in Turkish is \"Günaydın\" [goon-ay-DUHN]. You can use this until around noon.",
        "how are you": "\"How are you?\" in Turkish is \"Nasılsın?\" [nah-suhl-SUHN] for informal situations, or \"Nasılsınız?\" [nah-suhl-suh-NUHZ] for formal situations.",
        "grammar": "Turkish grammar has some unique features! Word order is typically Subject-Object-Verb (SOV). Turkish uses agglutination - adding suffixes to words to change meaning. Would you like to know about a specific grammar topic?",
        "pronunciation": "Turkish pronunciation is quite regular! Each letter typically has one sound. The stress is usually on the last syllable. Some key sounds: 'ş' sounds like 'sh', 'ç' sounds like 'ch', 'ğ' lengthens the previous vowel.",
        "learn": "Great question! To learn Turkish effectively: 1) Start with basic greetings and common phrases, 2) Practice with our TV series section, 3) Focus on pronunciation, 4) Learn word patterns and suffixes. Turkish is logical once you understand the patterns!"
    }
    
    # Check if the question contains any key words we can help with
    question_lower = question.question.lower()
    for key_word, response in fallback_responses.items():
        if key_word in question_lower:
            return TutorResponse(answer=response, session_id=session_id)
    
    # Generic helpful response
    helpful_response = """Merhaba! 👋 I'm Tulu, your Turkish language tutor. I'm here to help you learn Turkish! 

Here are some common Turkish phrases to get you started:

🇹🇷 **Basic Greetings:**
- **Merhaba** [mer-HAH-bah] = Hello
- **Günaydın** [goon-ay-DUHN] = Good morning  
- **İyi akşamlar** [ee-yee ahk-sham-LAR] = Good evening

🇹🇷 **Polite Expressions:**
- **Teşekkür ederim** [teh-shek-KOOR eh-deh-rim] = Thank you
- **Lütfen** [LOOT-fen] = Please
- **Özür dilerim** [ö-ZOOR dee-leh-rim] = I'm sorry

🇹🇷 **Useful Questions:**
- **Nasılsın?** [nah-suhl-SUHN] = How are you?
- **Adın ne?** [ah-DUHN neh] = What's your name?

Try asking me about any Turkish word, phrase, or grammar topic! You can also explore our TV series section to learn Turkish through authentic dialogue from popular Turkish shows.

What would you like to learn about Turkish today? 🎯"""
    
    return TutorResponse(answer=helpful_response, session_id=session_id)

@api_router.get("/tutor/history/{session_id}")
async def get_tutor_history(session_id: str):
    messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(100)
    return {"messages": [ChatMessage(**msg) for msg in messages]}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()