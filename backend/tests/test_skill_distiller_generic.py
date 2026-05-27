from app.skills.skill_distiller import SkillDistiller
from app.skills.skill_schema import SkillDistillRequest


def test_fallback_card_is_not_domain_hardcoded_for_commerce_text() -> None:
    request = SkillDistillRequest(
        tenant_id="tenant_demo",
        title="购买商品",
        raw_content="获取用户姓名，查询商品是否存在，生成对应订单号，反馈给用户",
        available_tools=[
            {"name": "product.purchase", "input_schema": {"required": ["product_id"]}},
            {"name": "order.add", "input_schema": {"required": ["product_id"]}},
        ],
    )

    card = SkillDistiller()._fallback_card(request)  # noqa: SLF001

    assert card.skill_id != "purchase_product"
    assert card.required_info == ["user_name"]
    assert any("call_tool:product.purchase" in step.allowed_actions for step in card.steps)
    assert any("call_tool:order.add" in step.allowed_actions for step in card.steps)


def test_slot_policy_targets_model_generated_fields() -> None:
    request = SkillDistillRequest(
        tenant_id="tenant_demo",
        title="设备报修",
        raw_content="收集设备编号和问题描述，创建维修工单",
    )
    raw = {
        "draft_skill": {
            "skill_id": "repair_ticket",
            "name": "设备报修",
            "required_info": ["asset_id"],
            "steps": [
                {
                    "step_id": "collect_repair_info",
                    "name": "收集报修信息",
                    "instruction": "同时抽取设备编号和问题描述。",
                    "expected_user_info": ["asset_id", "issue_desc"],
                    "allowed_actions": ["ask_user", "continue_flow"],
                }
            ],
        }
    }

    response = SkillDistiller()._normalize_response(raw, request)  # noqa: SLF001

    assert response.draft_skill.slot_filling_policy["target_info"] == ["asset_id", "issue_desc"]


def test_normalize_response_adds_closed_loop_tool_and_final_reply_steps() -> None:
    request = SkillDistillRequest(
        tenant_id="tenant_demo",
        title="退款处理",
        raw_content="获取订单号，核实订单是否符合退款条件，处理退款并反馈给用户",
        available_tools=[
            {
                "name": "order.query",
                "input_schema": {"required": ["order_id"]},
            }
        ],
    )
    raw = {
        "draft_skill": {
            "skill_id": "refund",
            "name": "退款处理",
            "required_info": ["order_id"],
            "steps": [
                {
                    "step_id": "collect_order",
                    "name": "收集订单",
                    "instruction": "收集订单号。",
                    "expected_user_info": ["order_id"],
                    "allowed_actions": ["ask_user", "continue_flow"],
                }
            ],
            "response_rules": [],
        }
    }

    response = SkillDistiller()._normalize_response(raw, request)  # noqa: SLF001
    steps = response.draft_skill.steps

    assert any("call_tool:order.query" in step.allowed_actions for step in steps)
    assert "answer_user" in steps[-1].allowed_actions
    assert any("不得把" in rule and "请稍候" in rule for rule in response.draft_skill.response_rules)
