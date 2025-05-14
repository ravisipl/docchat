from typing import List

class EmbeddingProvider:
    def embed_query(self, text: str) -> List[float]:
        raise NotImplementedError

    def embed_documents(self, texts: list) -> List[List[float]]:
        raise NotImplementedError 