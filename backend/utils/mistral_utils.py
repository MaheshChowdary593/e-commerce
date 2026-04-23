import os
import json
from mistralai.client import Mistral
from pydantic import ValidationError
import schemas

def parse_query_with_mistral(user_query: str) -> dict:
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key or api_key == "your_mistral_api_key_here":
        print("MISTRAL_API_KEY is not set or placeholder.")
        return {}

    model = "mistral-small-latest"
    client = Mistral(api_key=api_key)

    system_prompt = """
    You are an expert E-commerce AI Assistant. Your task is to parse user requests into a strict JSON format. 
    Accuracy is critical. IRRELEVANT RESULTS ARE UNACCEPTABLE.

    CORE PRINCIPLE:
    - Separate the "Subject" (the actual product item) from "Modifiers" (gender, color, brand, size).
    - If a user says "men shirts", "Shirts" is the CATEGORY, and "men" is the SUBJECT.
    - DO NOT repeat the category name in the "query" field if you have correctly identified the category.

    SUPPORTED CATEGORIES:
    - Shirts, Jeans, Pants, Footwear, Accessories, Boxers, Toys, Fashion, Electronics
    
    INTENTS:
    - SEARCH_PRODUCT (default)
    - ADD_TO_CART
    - VIEW_CART
    - RECOMMEND_PRODUCTS
    - REMOVE_FROM_CART
    
    OUTPUT JSON FIELDS:
    - action: The mapped intent.
    - query: The specific product subject (e.g., "men", "red silk", "gaming"). NO CATEGORY NAMES HERE.
    - category: The broad category from supported list or inferred.
    - price_min / price_max: Numerical values. (-1 for "cheap" marker).
    - brand / color / size: Extracted attributes.
    - rating_min: Minimum stars.
    - sort_by: "price_low", "price_high", "rating", "newest".
    - features: List of descriptive tags (e.g., ["cotton", "slim fit"]).
    
    EXAMPLES:
    "men shirts" -> {"query": "men", "category": "Shirts"}
    "black cotton jeans for men" -> {"query": "men", "category": "Jeans", "color": "black", "features": ["cotton"]}
    "cheap gaming laptop" -> {"query": "gaming laptop", "category": "Electronics", "price_max": -1, "sort_by": "price_low"}
    "nike running shoes" -> {"query": "running", "category": "Footwear", "brand": "Nike"}

    RULES:
    1. Output ONLY valid JSON.
    2. No markdown, no backticks.
    3. Keep the 'query' focused on sub-descriptors, NOT the category.
    """

    try:
        response = client.chat.complete(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ]
        )
        
        raw_content = response.choices[0].message.content.strip()
        if "```" in raw_content:
            raw_content = raw_content.replace("```json", "").replace("```", "").strip()
            
        json_data = json.loads(raw_content)
        
        # Ensure 'action' is present (assistant fallback)
        if "action" not in json_data:
            json_data["action"] = "SEARCH_PRODUCT"
            
        return json_data
        
    except Exception as e:
        print(f"Mistral Parsing Error: {e}")
        return {"action": "SEARCH_PRODUCT", "query": user_query, "price_max": None}
