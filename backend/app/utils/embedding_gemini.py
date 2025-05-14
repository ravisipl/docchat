from .embedding_base import EmbeddingProvider
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from typing import List

class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            task_type="retrieval_document",
            title="Document Embeddings",
            google_api_key=api_key
        )

    def embed_query(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)

    def embed_documents(self, texts: list) -> List[List[float]]:
        return self.embeddings.embed_documents(texts) 