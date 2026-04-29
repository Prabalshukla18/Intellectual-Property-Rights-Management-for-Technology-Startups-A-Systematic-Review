"""
Risk Scorer & Dashboard Data Module
Aggregates results from all modules into risk scores and dashboard metrics.
"""

import random
from datetime import datetime, timedelta


class RiskScorer:
    def get_dashboard_summary(self) -> dict:
        return {
            "overall_risk_score": 72,
            "risk_level": "HIGH",
            "patents_analyzed": 148,
            "patents_delta": 12,
            "trademark_conflicts": 7,
            "trademark_high_risk": 2,
            "prior_art_matches": 23,
            "prior_art_domains": 4,
            "ip_health": 38,
            "active_alerts": 3,
            "risk_dimensions": {
                "patent": 85,
                "trademark": 74,
                "prior_art": 69,
                "geographic": 55,
                "litigation": 40
            },
            "trademark_by_category": [
                {"category": "Logo / image",    "score": 88},
                {"category": "Brand name",      "score": 74},
                {"category": "Slogan",          "score": 55},
                {"category": "Domain name",     "score": 31},
                {"category": "Color palette",   "score": 18},
            ],
            "risk_distribution": {
                "high":   21,
                "medium": 45,
                "low":    34
            },
            "recent_records": [
                {"name": "NovaMind logo",             "type": "Trademark",  "similarity": 88, "risk": "HIGH",   "status": "Conflict detected"},
                {"name": "US10234567 — Neural iface", "type": "Patent",     "similarity": 85, "risk": "HIGH",   "status": "High similarity"},
                {"name": "EdgeSync brand name",       "type": "Trademark",  "similarity": 74, "risk": "MEDIUM", "status": "Review pending"},
                {"name": "AI scheduler claim 4",      "type": "Prior Art",  "similarity": 69, "risk": "MEDIUM", "status": "Prior art found"},
                {"name": "US09812345 — Edge ML",      "type": "Patent",     "similarity": 65, "risk": "MEDIUM", "status": "Under analysis"},
                {"name": "NovaMind slogan",           "type": "Trademark",  "similarity": 55, "risk": "MEDIUM", "status": "Low conflict"},
                {"name": "Federated model patent",    "type": "Prior Art",  "similarity": 61, "risk": "MEDIUM", "status": "Prior art found"},
                {"name": "US08765432 — Secure encl",  "type": "Patent",     "similarity": 44, "risk": "LOW",    "status": "Clear"},
                {"name": "TechNova wordmark",         "type": "Trademark",  "similarity": 32, "risk": "LOW",    "status": "Clear"},
                {"name": "US10987654 — NLP tokenizer","type": "Patent",     "similarity": 38, "risk": "LOW",    "status": "Clear"},
            ]
        }

    def get_trends(self) -> dict:
        months = []
        base = datetime.now()
        for i in range(5, -1, -1):
            d = base - timedelta(days=30 * i)
            months.append(d.strftime("%b"))

        return {
            "labels": months,
            "patent_filings":   [14, 18, 12, 22, 19, 27],
            "tm_conflicts":     [3,  5,  4,  7,  6,  9],
            "prior_art_hits":   [8,  11, 9,  15, 13, 18],
            "risk_score_trend": [58, 61, 65, 68, 71, 72],
        }

    def get_alerts(self) -> list:
        return [
            {
                "level": "HIGH",
                "title": "Patent infringement risk detected",
                "message": "Neural interface patent US10234567 has 91% similarity — potential infringement.",
                "time": "2 hours ago",
                "module": "Patent"
            },
            {
                "level": "HIGH",
                "title": "Trademark conflict — EU registration",
                "message": "NovaMind logo conflicts with EU trademark TM-2018-04421 (88% image similarity).",
                "time": "1 day ago",
                "module": "Trademark"
            },
            {
                "level": "MEDIUM",
                "title": "Brand name phonetic conflict",
                "message": "EdgeSync is phonetically similar to 3 registered trademarks in class 42.",
                "time": "3 days ago",
                "module": "Trademark"
            },
        ]

    def compute_risk(self, patent_score: float, tm_score: float, prior_art_score: float) -> dict:
        weights = {"patent": 0.4, "trademark": 0.35, "prior_art": 0.25}
        composite = (
            patent_score * weights["patent"] +
            tm_score * weights["trademark"] +
            prior_art_score * weights["prior_art"]
        )
        return {
            "composite_score": round(composite, 1),
            "level": "HIGH" if composite >= 70 else "MEDIUM" if composite >= 45 else "LOW",
            "components": {
                "patent": patent_score,
                "trademark": tm_score,
                "prior_art": prior_art_score
            }
        }
