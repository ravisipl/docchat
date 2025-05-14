from .embedding_base import EmbeddingProvider
from langchain_openai import OpenAIEmbeddings
from typing import List

class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key):
        self.embeddings = OpenAIEmbeddings(openai_api_key=api_key)

    def embed_query(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)

    def embed_documents(self, texts: list) -> List[List[float]]:
        return self.embeddings.embed_documents(texts) 