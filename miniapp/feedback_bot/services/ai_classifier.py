"""
AI Classification Service
Uses OpenAI GPT to classify feedback messages
"""
import json
import logging
from typing import Optional
from openai import AsyncOpenAI

import sys
sys.path.append('..')
from config import OPENAI_API_KEY, AI_MODEL

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Classification prompt
CLASSIFICATION_PROMPT = """Ты эксперт по анализу пользовательского фидбека для Telegram Mini App.

Проанализируй следующее сообщение из группы тестирования и определи:

1. **Тип** (item_type):
   - `bug` - баг, ошибка, что-то не работает
   - `feature` - запрос новой функции/возможности
   - `improvement` - улучшение существующего функционала
   - `ux` - проблема с UX/UI, неудобство использования
   - `question` - вопрос, нужна помощь
   - `other` - не относится к разработке

2. **Приоритет** (priority):
   - `critical` - блокирует использование приложения
   - `high` - серьёзная проблема, но обходной путь есть
   - `medium` - желательно исправить
   - `low` - мелочь, можно отложить

3. **Уверенность** (confidence): число от 0.0 до 1.0

4. **Теги** (tags): список ключевых слов (максимум 5)

5. **Краткое резюме** (summary): одно предложение на русском

Сообщение:
```
{message}
```

Ответь ТОЛЬКО в JSON формате:
{{"type": "bug|feature|improvement|ux|question|other", "priority": "critical|high|medium|low", "confidence": 0.XX, "tags": ["тег1", "тег2"], "summary": "Краткое описание проблемы или запроса"}}"""


async def classify_message(text: str) -> dict:
    """
    Classify a message using AI.
    Returns classification dict with type, priority, confidence, tags, summary.
    """
    # Default fallback
    fallback = {
        "type": "other",
        "priority": "medium",
        "confidence": 0.0,
        "tags": [],
        "summary": text[:100] + ("..." if len(text) > 100 else ""),
        "processed_content": None
    }
    
    # If no API key, use fallback with simple heuristics
    if not client:
        logger.warning("No OpenAI API key, using heuristic classification")
        return _heuristic_classify(text)
    
    try:
        response = await client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Ты AI-ассистент для классификации фидбека. Отвечай только в JSON формате."
                },
                {
                    "role": "user",
                    "content": CLASSIFICATION_PROMPT.format(message=text)
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=500
        )
        
        result_text = response.choices[0].message.content
        result = json.loads(result_text)
        
        # Validate and sanitize
        result = _validate_classification(result, text)
        
        logger.debug(f"AI classification: {result}")
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {e}")
        return fallback
    except Exception as e:
        logger.error(f"AI classification error: {e}")
        return fallback


def _validate_classification(result: dict, original_text: str) -> dict:
    """Validate and sanitize AI classification result"""
    valid_types = ['bug', 'feature', 'improvement', 'ux', 'question', 'other']
    valid_priorities = ['critical', 'high', 'medium', 'low']
    
    return {
        "type": result.get("type") if result.get("type") in valid_types else "other",
        "priority": result.get("priority") if result.get("priority") in valid_priorities else "medium",
        "confidence": min(1.0, max(0.0, float(result.get("confidence", 0.5)))),
        "tags": result.get("tags", [])[:5] if isinstance(result.get("tags"), list) else [],
        "summary": result.get("summary", original_text[:100])[:500],
        "processed_content": None
    }


def _heuristic_classify(text: str) -> dict:
    """Simple heuristic classification when AI is not available"""
    text_lower = text.lower()
    
    # Detect type
    item_type = "other"
    if any(w in text_lower for w in ['баг', 'ошибка', 'не работает', 'сломал', 'crash', 'bug', 'error']):
        item_type = "bug"
    elif any(w in text_lower for w in ['хочу', 'было бы', 'добавить', 'feature', 'фича', 'новая функция']):
        item_type = "feature"
    elif any(w in text_lower for w in ['улучшить', 'лучше', 'изменить', 'поменять']):
        item_type = "improvement"
    elif any(w in text_lower for w in ['неудобно', 'непонятно', 'ui', 'ux', 'интерфейс', 'кнопка']):
        item_type = "ux"
    elif any(w in text_lower for w in ['как', 'почему', 'где', '?', 'вопрос', 'помогите']):
        item_type = "question"
    
    # Detect priority
    priority = "medium"
    if any(w in text_lower for w in ['критично', 'срочно', 'блокер', 'critical', 'urgent']):
        priority = "critical"
    elif any(w in text_lower for w in ['важно', 'серьёзно', 'major']):
        priority = "high"
    elif any(w in text_lower for w in ['мелочь', 'потом', 'minor', 'низкий']):
        priority = "low"
    
    return {
        "type": item_type,
        "priority": priority,
        "confidence": 0.3,  # Low confidence for heuristics
        "tags": [],
        "summary": text[:100] + ("..." if len(text) > 100 else ""),
        "processed_content": None
    }
