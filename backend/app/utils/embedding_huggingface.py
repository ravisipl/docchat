from .embedding_base import EmbeddingProvider
from langchain_community.embeddings import HuggingFaceEmbeddings
from typing import List

class HuggingFaceEmbeddingProvider(EmbeddingProvider):
    def __init__(self, model_name):
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)

    def embed_query(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)

    def embed_documents(self, texts: list) -> List[List[float]]:
        return self.embeddings.embed_documents(texts) 