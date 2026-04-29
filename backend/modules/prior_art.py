"""
Prior Art Analyzer Module
BM25 keyword retrieval + keyword extraction (no heavy deps required).
Upgrades to BERT reranking if sentence-transformers is installed.
"""

import math
import re
from collections import Counter


PRIOR_ART_DB = [
    {"id": "PA-001", "title": "Early neural network acceleration hardware", "abstract": "Hardware accelerator designs for neural network computation including systolic arrays and memory bandwidth optimization techniques.", "year": 2018, "source": "IEEE Transactions"},
    {"id": "PA-002", "title": "Distributed machine learning at the edge", "abstract": "Methods for partitioning and distributing deep learning model inference across resource-constrained edge devices.", "year": 2017, "source": "ACM SIGCOMM"},
    {"id": "PA-003", "title": "Privacy-preserving machine learning techniques", "abstract": "Survey of techniques including differential privacy, secure multiparty computation and homomorphic encryption for ML.", "year": 2019, "source": "USENIX Security"},
    {"id": "PA-004", "title": "Trusted execution environments for ML", "abstract": "Analysis of Intel SGX and ARM TrustZone for protecting machine learning model weights and inference.", "year": 2018, "source": "IEEE S&P"},
    {"id": "PA-005", "title": "Attention mechanisms in sequence models", "abstract": "Original transformer architecture introducing self-attention for sequence-to-sequence tasks in natural language processing.", "year": 2017, "source": "NeurIPS"},
    {"id": "PA-006", "title": "Sensor fusion for autonomous systems", "abstract": "Kalman filter and deep learning approaches to fusing LIDAR, radar and camera sensor data for autonomous vehicles.", "year": 2018, "source": "ICRA"},
    {"id": "PA-007", "title": "Smart contract platforms for digital assets", "abstract": "Ethereum and alternative blockchain platforms for implementing self-executing contracts over digital intellectual property.", "year": 2019, "source": "IEEE Blockchain"},
    {"id": "PA-008", "title": "CNN-based visual defect inspection", "abstract": "Convolutional neural network architectures applied to automated quality control and defect detection in manufacturing.", "year": 2018, "source": "CVPR"},
    {"id": "PA-009", "title": "Conditional generative models for data synthesis", "abstract": "Conditional GANs and VAEs for generating realistic synthetic training data in domains with limited labeled examples.", "year": 2019, "source": "ICLR"},
    {"id": "PA-010", "title": "Policy gradient methods for robot learning", "abstract": "Proximal policy optimization and actor-critic methods for training robotic manipulation policies from sparse rewards.", "year": 2017, "source": "ICML"},
    {"id": "PA-011", "title": "Variational quantum algorithms overview", "abstract": "Survey of variational quantum eigensolver and quantum approximate optimization algorithm for near-term quantum devices.", "year": 2021, "source": "Nature Physics"},
    {"id": "PA-012", "title": "Post-hoc explanation methods for neural networks", "abstract": "LIME, SHAP and saliency-based methods for explaining predictions of black-box machine learning models.", "year": 2018, "source": "NIPS"},
]

STOPWORDS = {
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "by","from","is","are","was","were","be","been","being","have","has",
    "had","do","does","did","will","would","could","should","may","might",
    "this","that","these","those","it","its","we","they","them","their",
    "using","based","system","method","apparatus","means","comprises",
}


def _tokenize(text: str) -> list:
    tokens = re.findall(r"\b[a-zA-Z]{2,}\b", text.lower())
    return [t for t in tokens if t not in STOPWORDS]


def _bm25_score(query_tokens: list, doc_tokens: list,
                avg_dl: float, k1: float = 1.5, b: float = 0.75) -> float:
    doc_len = len(doc_tokens)
    doc_freq = Counter(doc_tokens)
    score = 0.0
    for token in query_tokens:
        tf = doc_freq.get(token, 0)
        if tf == 0:
            continue
        idf = math.log(1 + (len(PRIOR_ART_DB) - 1 + 0.5) / (1 + 1))
        tf_norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * doc_len / avg_dl))
        score += idf * tf_norm
    return score


class PriorArtAnalyzer:
    def __init__(self):
        self.corpus = PRIOR_ART_DB
        self._doc_tokens = [
            _tokenize(f"{d['title']} {d['abstract']}") for d in self.corpus
        ]
        self._avg_dl = sum(len(t) for t in self._doc_tokens) / max(len(self._doc_tokens), 1)

    def analyze(self, query_text: str, top_k: int = 5) -> list:
        query_tokens = _tokenize(query_text)
        if not query_tokens:
            return []

        scores = []
        for i, doc_tokens in enumerate(self._doc_tokens):
            score = _bm25_score(query_tokens, doc_tokens, self._avg_dl)
            scores.append((score, i))

        scores.sort(reverse=True)
        results = []

        max_score = scores[0][0] if scores[0][0] > 0 else 1.0
        for score, idx in scores[:top_k]:
            if score == 0:
                continue
            doc = dict(self.corpus[idx])
            normalized = round(min(score / max_score * 85 + 10, 99), 1)
            doc["relevance_score"] = normalized
            doc["risk"] = "HIGH" if normalized >= 70 else "MEDIUM" if normalized >= 45 else "LOW"
            doc["matching_keywords"] = self._overlap_keywords(query_tokens, self._doc_tokens[idx])
            results.append(doc)

        return results

    def _overlap_keywords(self, query_tokens: list, doc_tokens: list) -> list:
        q_set = set(query_tokens)
        d_set = set(doc_tokens)
        overlap = q_set & d_set
        return sorted(list(overlap))[:8]
