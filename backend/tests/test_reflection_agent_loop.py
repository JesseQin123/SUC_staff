from app.core.agent_loop import AgentLoop
from app.core.reflection_agent import ReflectionDecision
from app.db.models import ChatSession, Skill, Tool
from app.session.session_schema import RouterDecision


def test_reflection_switches_wrong_active_skill_without_suspending() -> None:
    loop = object.__new__(AgentLoop)
    session = ChatSession(
        id="session_test",
        tenant_id="tenant_demo",
        active_skill_id="visitor_badge",
        active_step_id="collect_visitor",
    )

    decision = loop._router_decision_from_reflection(
        ReflectionDecision(
            needs_retry=True,
            reason="用户要报修，不是办理访客证。",
            target_skill_id="repair_ticket",
        ),
        session,
        [_skill("visitor_badge"), _skill("repair_ticket")],
        previous_decision=RouterDecision(decision="continue_current_skill"),
    )

    assert decision is not None
    assert decision.decision == "start_skill"
    assert decision.target_skill_id == "repair_ticket"


def test_reflection_builds_tool_call_from_slots() -> None:
    loop = object.__new__(AgentLoop)
    session = ChatSession(
        id="session_test",
        tenant_id="tenant_demo",
        active_skill_id="repair_ticket",
        slots_json={"customer_name": "张三", "asset_id": "EQ-9", "issue": "无法启动"},
    )

    tool_call = loop._tool_call_from_reflection(
        ReflectionDecision(needs_retry=True, target_tool_name="ticket.create"),
        session,
        [_ticket_tool()],
    )

    assert tool_call is not None
    assert tool_call.name == "ticket.create"
    assert tool_call.arguments["customer_name"] == "张三"
    assert tool_call.arguments["asset_id"] == "EQ-9"
    assert tool_call.arguments["issue"] == "无法启动"


def test_reflection_builds_backup_search_tool_call_from_query_slot() -> None:
    loop = object.__new__(AgentLoop)
    session = ChatSession(
        id="session_test",
        tenant_id="tenant_demo",
        active_skill_id="reflection_lookup_test",
        slots_json={"query": "影子文档"},
    )

    tool_call = loop._tool_call_from_reflection(
        ReflectionDecision(needs_retry=True, target_tool_name="reflection.backup_search"),
        session,
        [_backup_search_tool()],
    )

    assert tool_call is not None
    assert tool_call.name == "reflection.backup_search"
    assert tool_call.arguments == {"query": "影子文档"}


def test_reflection_tool_retry_is_preferred_for_current_skill_target() -> None:
    loop = object.__new__(AgentLoop)
    session = ChatSession(
        id="session_test",
        tenant_id="tenant_demo",
        active_skill_id="reflection_lookup_test",
    )

    assert loop._reflection_tool_retry_targets_current_skill(
        ReflectionDecision(
            needs_retry=True,
            target_skill_id="reflection_lookup_test",
            target_tool_name="reflection.backup_search",
        ),
        session,
    )


def _skill(skill_id: str) -> Skill:
    return Skill(
        tenant_id="tenant_demo",
        skill_id=skill_id,
        name=skill_id,
        content_json={
            "skill_id": skill_id,
            "name": skill_id,
            "steps": [{"step_id": "start", "name": "开始", "allowed_actions": ["ask_user"]}],
        },
        status="published",
    )


def _ticket_tool() -> Tool:
    return Tool(
        tenant_id="tenant_demo",
        name="ticket.create",
        display_name="创建工单",
        method="POST",
        url="http://localhost:8000/api/mock/ticket/create",
        input_schema={
            "type": "object",
            "properties": {
                "customer_name": {"type": "string"},
                "asset_id": {"type": "string"},
                "issue": {"type": "string"},
            },
            "required": ["customer_name", "asset_id", "issue"],
        },
        allowed_skills_json=["repair_ticket"],
        enabled=True,
    )


def _backup_search_tool() -> Tool:
    return Tool(
        tenant_id="tenant_demo",
        name="reflection.backup_search",
        display_name="反思测试备用查询",
        method="POST",
        url="http://localhost:8000/api/mock/reflection/backup-search",
        input_schema={
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
        allowed_skills_json=["reflection_lookup_test"],
        enabled=True,
    )
