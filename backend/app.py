from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import urllib.request
import urllib.error

app = Flask(__name__)
CORS(app)


def safe_num(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def normalize_weights(weights):
    total = sum(safe_num(v, 0.0) for v in weights.values())
    if total <= 0:
        return {k: 1 / len(weights) for k in weights}
    return {k: safe_num(v, 0.0) / total for k, v in weights.items()}


def score_model(payload):
    profile = payload.get("profile", {})
    weights = normalize_weights(payload.get("weights", {}))
    jp = payload.get("japan", {})
    rt = payload.get("return", {})
    c = payload.get("constraints", {})
    o = payload.get("options", {})

    money_scale = 0.01
    jp_salary = safe_num(jp.get("salary")) * money_scale
    jp_cost = safe_num(jp.get("cost")) * money_scale
    jp_growth = safe_num(jp.get("growth"), 5)
    jp_wlb = safe_num(jp.get("wlb"), 5)
    jp_visa = safe_num(jp.get("visaStability"), 5)
    jp_lang = safe_num(jp.get("languageComfort"), 5)
    jp_network = safe_num(jp.get("network"), 5)
    jp_env_fit = safe_num(jp.get("environmentFit"), 5)
    jp_global_options = safe_num(jp.get("globalOptions"), 5)
    jp_industry = safe_num(jp.get("industryOutlook"), 5)

    rt_salary = safe_num(rt.get("salary")) * money_scale
    rt_cost = safe_num(rt.get("cost")) * money_scale
    rt_growth = safe_num(rt.get("growth"), 5)
    rt_family = safe_num(rt.get("familySupport"), 5)
    rt_stress = safe_num(rt.get("marketStress"), 5)
    rt_network = safe_num(rt.get("network"), 5)
    rt_industry = safe_num(rt.get("industryOutlook"), 5)
    rt_location = rt.get("locationType", "coastal")
    rt_iron_bowl = bool(rt.get("familyHelpIronBowl"))

    family_urgent = bool(c.get("familyUrgent"))
    health_issue = bool(c.get("healthIssue"))
    savings_months = safe_num(c.get("savingsMonths"), 3)
    debt = safe_num(c.get("debt"), 0)
    reset_cost = safe_num(c.get("careerResetCost"), 5)

    visa_type = profile.get("visaType", "")
    visa_months_left = safe_num(profile.get("visaMonthsLeft"), 12)
    if visa_type in ("permanent", "spouse-permanent"):
        visa_months_left = 120
    years_japan = safe_num(profile.get("yearsJapan"), 1)

    risk_tol = safe_num(o.get("riskTolerance"), 5)
    consider_third = bool(o.get("considerThirdCountry"))
    plan_study = bool(o.get("planStudy"))

    money_w = weights.get("money", 0.18)
    growth_w = weights.get("growth", 0.18)
    life_w = weights.get("life", 0.14)
    family_w = weights.get("family", 0.14)
    identity_w = weights.get("identity", 0.12)
    risk_w = weights.get("risk", 0.12)
    industry_w = weights.get("industry", 0.12)

    visa_type_bonus_map = {
        "permanent": 3.0,
        "spouse-permanent": 2.5,
        "high-skilled": 1.5,
        "business-manager": 1.0,
        "work": 0.0,
        "student": -0.5,
        "spouse": 0.5,
        "other": 0.0
    }
    visa_type_bonus = visa_type_bonus_map.get(visa_type, 0.0)

    jp_parts = {
        "money": money_w * (jp_salary - jp_cost),
        "growth": growth_w * jp_growth,
        "life": life_w * jp_wlb,
        "family": family_w * (10 - (6 if family_urgent else 2)),
        "identity": identity_w * (jp_lang + jp_env_fit) / 2,
        "risk": risk_w * jp_visa,
        "industry": industry_w * jp_industry,
        "network": 0.3 * jp_network,
        "options": 0.25 * jp_global_options,
        "visa_type_bonus": visa_type_bonus
    }
    jp_score = sum(jp_parts.values())

    location_bonus = 1.2 if rt_location == "coastal" else 0.2
    iron_bowl_bonus = 5.0 if rt_iron_bowl else 0.0

    rt_parts = {
        "money": money_w * (rt_salary - rt_cost),
        "growth": growth_w * rt_growth,
        "life": life_w * (10 - rt_stress),
        "family": family_w * rt_family,
        "identity": identity_w * 6,
        "risk": risk_w * (10 - reset_cost),
        "industry": industry_w * rt_industry,
        "network": 0.3 * rt_network,
        "location_bonus": location_bonus,
        "iron_bowl_bonus": iron_bowl_bonus
    }
    rt_score = sum(rt_parts.values())

    third_parts = {
        "avg_base": 0.6 * (jp_score + rt_score) / 2,
        "risk_tolerance": 0.3 * risk_tol,
        "consider_third": 0.2 * (10 if consider_third else 0),
        "debt_penalty": -0.2 * debt
    }
    third_score = sum(third_parts.values())

    penalties = 0
    if visa_months_left < 6:
        jp_score -= 4
        penalties += 1
    if health_issue:
        jp_score -= 3
        penalties += 1
    if savings_months < 3:
        jp_score -= 2
        rt_score -= 1
        penalties += 1
    if plan_study:
        jp_score += 1
        rt_score += 1

    if years_japan > 4:
        jp_score += 1

    return {
        "scores": {
            "japan": round(jp_score, 2),
            "return": round(rt_score, 2),
            "third": round(third_score, 2)
        },
        "breakdown": {
            "japan": {k: round(v, 2) for k, v in jp_parts.items()},
            "return": {k: round(v, 2) for k, v in rt_parts.items()},
            "third": {k: round(v, 2) for k, v in third_parts.items()}
        },
        "signals": {
            "penalties": penalties,
            "family_urgent": family_urgent,
            "health_issue": health_issue,
            "visa_months_left": visa_months_left,
            "visa_type": visa_type,
            "iron_bowl": rt_iron_bowl,
            "location": rt_location
        }
    }


def build_recommendation(model, payload):
    scores = model["scores"]
    signals = model["signals"]
    options = payload.get("options", {})

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_key, top_score = sorted_scores[0]
    second_key, second_score = sorted_scores[1]

    if signals["family_urgent"] or signals["health_issue"]:
        top_key = "return"

    if signals["visa_months_left"] < 6 and options.get("considerThirdCountry"):
        top_key = "third"

    title_map = {
        "japan": "继续在日，增强筹码",
        "return": "回国窗口期行动",
        "third": "第三国过渡方案"
    }

    summary_map = {
        "japan": "你在日本的职业与环境回报仍有优势，但需要强化签证与行业选择。",
        "return": "回国在家庭与稳定性维度更有优势，需提前布局岗位与城市落地。",
        "third": "第三国过渡能降低短期风险，但需要资源与执行力支撑。"
    }

    actions_map = {
        "japan": [
            "锁定 6-12 个月内可提升薪资或晋升的路径",
            "建立备用雇主或项目，降低签证风险",
            "补足关键技能或证书，提升议价能力"
        ],
        "return": [
            "列出 3-5 家目标公司并提前面试",
            "规划回国成本与过渡期资金",
            "提前沟通家庭安排，降低落地压力"
        ],
        "third": [
            "选择 1-2 个目的地并验证签证可行性",
            "评估第三国成本与收入差",
            "准备双线方案：第三国与回国/留日并行"
        ]
    }

    reasons = [
        f"最高评分方案为 {title_map[top_key]}，分数 {top_score}",
        f"第二方案为 {title_map[second_key]}，分数 {second_score}",
        f"惩罚信号数量：{signals['penalties']}"
    ]

    if signals.get("iron_bowl"):
        reasons.append("家庭可安排稳定岗位，回国方案显著加分")
    if signals.get("visa_type") in ("permanent", "spouse-permanent"):
        reasons.append("签证长期稳定，对留日方案加分")
    if signals.get("visa_type") == "high-skilled":
        reasons.append("高度人才签证具备发展优势")

    risks = []
    if signals["visa_months_left"] < 12:
        risks.append("签证时间不足，需准备替代方案")
    if payload.get("constraints", {}).get("savingsMonths", 0) < 3:
        risks.append("现金流缓冲不足，风险承压")
    if payload.get("constraints", {}).get("familyUrgent"):
        risks.append("家庭因素可能压缩执行时间")
    if not risks:
        risks.append("主要风险可控，保持监测即可")

    path_map = {
        "japan": [
            "明确目标岗位与语言/技能短板",
            "锁定签证续签与跳槽窗口",
            "12 个月内拿到更优职位"
        ],
        "return": [
            "确定回国城市与岗位类型",
            "完成面试与资源对接",
            "3-6 个月内完成落地"
        ],
        "third": [
            "确认第三国可行性",
            "准备多地求职与签证材料",
            "保留回国/留日的备选方案"
        ]
    }

    return {
        "title": title_map[top_key],
        "summary": summary_map[top_key],
        "actions": actions_map[top_key],
        "reasons": reasons,
        "risks": risks,
        "path": path_map[top_key]
    }


@app.route("/api/evaluate", methods=["POST"])
def evaluate():
    payload = request.get_json(silent=True) or {}
    model = score_model(payload)
    recommendation = build_recommendation(model, payload)
    return jsonify({
        "scores": model["scores"],
        "breakdown": model["breakdown"],
        "recommendation": recommendation
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/fx", methods=["GET"])
def fx():
    url = "https://open.er-api.com/v6/latest/JPY"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        rate = payload.get("rates", {}).get("CNY")
        if not rate:
            raise ValueError("rate missing")
        return jsonify({"rate": rate, "source": "open.er-api.com"})
    except (urllib.error.URLError, ValueError) as e:
        app.logger.warning("fx fetch failed: %s", e)
        return jsonify({"rate": None, "error": "fx_unavailable"}), 503

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
