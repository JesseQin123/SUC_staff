from app.api.mock import (
    MockReflectionSearchRequest,
    mock_reflection_backup_search,
    mock_reflection_primary_search,
)


def test_reflection_primary_search_returns_miss_for_probe_query() -> None:
    result = mock_reflection_primary_search(MockReflectionSearchRequest(query="影子文档"))

    assert result["found"] is False
    assert result["miss_reason"] == "primary_index_miss"


def test_reflection_backup_search_returns_probe_answer() -> None:
    result = mock_reflection_backup_search(MockReflectionSearchRequest(query="影子文档"))

    assert result["found"] is True
    assert result["source"] == "backup_index"
    assert "反思能力" in result["answer"]
