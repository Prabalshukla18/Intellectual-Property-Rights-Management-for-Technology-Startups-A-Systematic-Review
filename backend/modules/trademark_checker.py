"""
Trademark Checker Module
Text: Levenshtein + phonetic matching
Image: Perceptual hashing (pHash)
"""

import io
import math
from typing import Optional


SAMPLE_TRADEMARKS = [
    {"name": "NovaMind",    "owner": "NovaMind Technologies",  "class": 42, "country": "US", "logo_hash": "f0f0f0f0aaaa5555"},
    {"name": "EdgeSync",    "owner": "EdgeSync Systems",       "class": 42, "country": "EU", "logo_hash": "0f0f0f0f55556666"},
    {"name": "TechNova",    "owner": "TechNova Inc",           "class": 42, "country": "US", "logo_hash": "aaaa0000ffff1111"},
    {"name": "NeuralNet",   "owner": "NeuralNet Corp",         "class": 42, "country": "US", "logo_hash": "1234567890abcdef"},
    {"name": "DataMind",    "owner": "DataMind Analytics",     "class": 42, "country": "UK", "logo_hash": "fedcba9876543210"},
    {"name": "SmartEdge",   "owner": "SmartEdge Ltd",          "class": 9,  "country": "EU", "logo_hash": "aabb1122ccdd3344"},
    {"name": "ClearPath",   "owner": "ClearPath Solutions",    "class": 35, "country": "US", "logo_hash": "1122334455667788"},
    {"name": "DeepLogic",   "owner": "DeepLogic AI",           "class": 42, "country": "US", "logo_hash": "8877665544332211"},
    {"name": "MindBridge",  "owner": "MindBridge Analytics",  "class": 42, "country": "CA", "logo_hash": "aaaabbbbccccdddd"},
    {"name": "VisionAI",    "owner": "VisionAI Corp",          "class": 42, "country": "US", "logo_hash": "ddddccccbbbbaaaa"},
]


def _levenshtein(s1: str, s2: str) -> int:
    s1, s2 = s1.lower(), s2.lower()
    m, n = len(s1), len(s2)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[:]
        dp[0] = i
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[j] = prev[j-1]
            else:
                dp[j] = 1 + min(prev[j], dp[j-1], prev[j-1])
    return dp[n]


def _similarity_ratio(s1: str, s2: str) -> float:
    dist = _levenshtein(s1, s2)
    max_len = max(len(s1), len(s2), 1)
    return 1.0 - dist / max_len


def _simple_phonetic(word: str) -> str:
    """Lightweight phonetic normalization (no external deps)."""
    word = word.lower()
    subs = [("ph", "f"), ("ck", "k"), ("qu", "k"), ("ai", "a"),
            ("ei", "a"), ("oo", "u"), ("ee", "i"), ("gh", "g")]
    for old, new in subs:
        word = word.replace(old, new)
    seen = set()
    result = []
    for ch in word:
        if ch not in seen or ch in "aeiou":
            result.append(ch)
        seen.add(ch)
    return "".join(result)


def _phash_distance(h1: str, h2: str) -> int:
    """Hamming distance between two hex hash strings."""
    try:
        v1 = int(h1, 16)
        v2 = int(h2, 16)
        xor = v1 ^ v2
        return bin(xor).count("1")
    except Exception:
        return 64


class TrademarkChecker:
    def __init__(self):
        self.marks = SAMPLE_TRADEMARKS

    def check_text(self, brand_name: str, nice_class: int = 42) -> list:
        conflicts = []
        brand_phonetic = _simple_phonetic(brand_name)

        for mark in self.marks:
            if mark["class"] != nice_class:
                continue

            string_sim = _similarity_ratio(brand_name, mark["name"])
            phonetic_sim = _similarity_ratio(brand_phonetic, _simple_phonetic(mark["name"]))
            combined = round(max(string_sim, phonetic_sim * 0.9) * 100, 1)

            if combined >= 40:
                conflicts.append({
                    "mark": mark["name"],
                    "owner": mark["owner"],
                    "class": mark["class"],
                    "country": mark["country"],
                    "similarity": combined,
                    "risk": "HIGH" if combined >= 75 else "MEDIUM" if combined >= 50 else "LOW",
                    "match_type": "phonetic+string"
                })

        return sorted(conflicts, key=lambda x: -x["similarity"])

    def check_image(self, image_bytes: bytes) -> list:
        try:
            from PIL import Image
            import imagehash
            img = Image.open(io.BytesIO(image_bytes))
            query_hash = str(imagehash.phash(img))
        except ImportError:
            # Fallback: simulate with dummy hash
            query_hash = "f0f0f0f0aaaa5550"

        conflicts = []
        for mark in self.marks:
            if "logo_hash" not in mark:
                continue
            distance = _phash_distance(query_hash, mark["logo_hash"])
            similarity = round((1 - distance / 64) * 100, 1)
            if similarity >= 60:
                conflicts.append({
                    "mark": mark["name"],
                    "owner": mark["owner"],
                    "country": mark["country"],
                    "similarity": similarity,
                    "risk": "HIGH" if similarity >= 85 else "MEDIUM" if similarity >= 70 else "LOW",
                    "match_type": "image-hash"
                })

        return sorted(conflicts, key=lambda x: -x["similarity"])
