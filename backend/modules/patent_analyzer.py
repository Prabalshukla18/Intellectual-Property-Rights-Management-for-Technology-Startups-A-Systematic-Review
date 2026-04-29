"""
Patent Analyzer Module
Uses Sentence Transformers + FAISS for semantic similarity search.
Falls back to TF-IDF if sentence-transformers is not installed.
"""

import json
import pickle
import numpy as np
from pathlib import Path
from typing import Optional

# ── Sample dataset (used when no real index exists) ───────────
SAMPLE_PATENTS = [
    {"id": "US10234567", "title": "Neural interface for machine learning acceleration", "abstract": "A neural processing unit that accelerates machine learning workloads using specialized tensor cores and dynamic voltage scaling.", "assignee": "DeepTech Corp", "year": 2021, "class": "G06N"},
    {"id": "US09812345", "title": "Edge computing scheduler for distributed ML inference", "abstract": "System and method for scheduling machine learning inference tasks across edge computing nodes using reinforcement learning.", "assignee": "EdgeAI Inc", "year": 2020, "class": "G06F"},
    {"id": "US11045678", "title": "Federated learning with differential privacy", "abstract": "Privacy-preserving federated learning framework that applies differential privacy noise to model gradients before aggregation.", "assignee": "PrivacyML LLC", "year": 2022, "class": "G06N"},
    {"id": "US08765432", "title": "Secure enclave for AI model protection", "abstract": "Hardware-based trusted execution environment for protecting proprietary AI models from extraction attacks.", "assignee": "SecureAI Corp", "year": 2019, "class": "G06F"},
    {"id": "US10987654", "title": "Transformer-based NLP tokenization system", "abstract": "Adaptive tokenization system using transformer architecture for multi-lingual natural language processing tasks.", "assignee": "NLPLabs", "year": 2021, "class": "G06F"},
    {"id": "US11234890", "title": "Autonomous vehicle perception pipeline", "abstract": "Multi-sensor fusion pipeline combining LIDAR, camera and radar data for real-time obstacle detection in autonomous vehicles.", "assignee": "AutoDrive Inc", "year": 2022, "class": "G06V"},
    {"id": "US10456123", "title": "Blockchain-based IP rights management", "abstract": "Decentralized system for managing intellectual property rights using smart contracts on a blockchain network.", "assignee": "IPChain Corp", "year": 2020, "class": "G06Q"},
    {"id": "US09345678", "title": "Computer vision defect detection system", "abstract": "Deep learning-based visual inspection system for detecting manufacturing defects using convolutional neural networks.", "assignee": "VisionAI LLC", "year": 2019, "class": "G06V"},
    {"id": "US11567890", "title": "Generative adversarial network for data augmentation", "abstract": "GAN-based synthetic data generation system for augmenting training datasets in low-data machine learning scenarios.", "assignee": "DataGen Corp", "year": 2023, "class": "G06N"},
    {"id": "US10678901", "title": "Reinforcement learning for robotic manipulation", "abstract": "Deep reinforcement learning system for training robotic arms to perform complex manipulation tasks in unstructured environments.", "assignee": "RoboLearn Inc", "year": 2021, "class": "G06N"},
    {"id": "US11890123", "title": "Quantum machine learning optimization", "abstract": "Variational quantum circuit approach for optimizing machine learning model parameters using quantum computing hardware.", "assignee": "QuantumML Labs", "year": 2023, "class": "G06N"},
    {"id": "US10123456", "title": "Explainable AI decision system", "abstract": "Framework for generating human-interpretable explanations for decisions made by black-box machine learning models.", "assignee": "ExplainAI Corp", "year": 2020, "class": "G06N"},
]


class PatentAnalyzer:
    def __init__(self):
        self.model = None
        self.index = None
        self.metadata = SAMPLE_PATENTS
        self.tfidf_matrix = None
        self.vectorizer = None
        self._load_or_build()

    def _load_or_build(self):
        """Try sentence-transformers first, fall back to TF-IDF."""
        try:
            from sentence_transformers import SentenceTransformer
            import faiss

            index_path = Path("data/patent_index.faiss")
            meta_path = Path("data/patent_metadata.pkl")

            if index_path.exists() and meta_path.exists():
                self.index = faiss.read_index(str(index_path))
                with open(meta_path, "rb") as f:
                    self.metadata = pickle.load(f)
                print("[PatentAnalyzer] Loaded FAISS index from disk.")
            else:
                print("[PatentAnalyzer] Building FAISS index from sample data...")
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                self._build_faiss_index(SAMPLE_PATENTS)

        except ImportError:
            print("[PatentAnalyzer] sentence-transformers not found. Using TF-IDF fallback.")
            self._build_tfidf_index(SAMPLE_PATENTS)

    def _build_faiss_index(self, patents):
        import faiss
        from sentence_transformers import SentenceTransformer

        if self.model is None:
            self.model = SentenceTransformer("all-MiniLM-L6-v2")

        texts = [f"{p['title']} {p['abstract']}" for p in patents]
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        dim = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings.astype(np.float32))
        self.metadata = patents

        Path("data").mkdir(exist_ok=True)
        faiss.write_index(self.index, "data/patent_index.faiss")
        with open("data/patent_metadata.pkl", "wb") as f:
            pickle.dump(patents, f)

    def _build_tfidf_index(self, patents):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        self.metadata = patents
        texts = [f"{p['title']} {p['abstract']}" for p in patents]
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)

    def find_similar(self, query_text: str, top_k: int = 5) -> list:
        if self.index is not None:
            return self._search_faiss(query_text, top_k)
        elif self.tfidf_matrix is not None:
            return self._search_tfidf(query_text, top_k)
        return []

    def _search_faiss(self, query_text: str, top_k: int) -> list:
        import faiss
        query_vec = self.model.encode([query_text], normalize_embeddings=True)
        scores, indices = self.index.search(query_vec.astype(np.float32), top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            patent = dict(self.metadata[idx])
            patent["similarity_score"] = round(float(score) * 100, 1)
            patent["risk_level"] = self._risk(float(score) * 100)
            results.append(patent)
        return results

    def _search_tfidf(self, query_text: str, top_k: int) -> list:
        from sklearn.metrics.pairwise import cosine_similarity

        query_vec = self.vectorizer.transform([query_text])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        top_indices = scores.argsort()[::-1][:top_k]

        results = []
        for idx in top_indices:
            patent = dict(self.metadata[idx])
            patent["similarity_score"] = round(float(scores[idx]) * 100, 1)
            patent["risk_level"] = self._risk(float(scores[idx]) * 100)
            results.append(patent)
        return results

    def _risk(self, score: float) -> str:
        if score > 75:
            return "HIGH"
        if score > 50:
            return "MEDIUM"
        return "LOW"

    def add_patents(self, patents: list):
        """Add new patents and rebuild index."""
        self.metadata.extend(patents)
        if self.index is not None:
            self._build_faiss_index(self.metadata)
        else:
            self._build_tfidf_index(self.metadata)
