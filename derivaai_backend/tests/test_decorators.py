import logging

import pytest

from app.core.decorators import log_call, log_errors


def test_log_call_sync_logs_and_returns(caplog):
    @log_call
    def f():
        return 1

    with caplog.at_level(logging.DEBUG):
        assert f() == 1
    rec = next(r for r in caplog.records if r.event == "method_call")
    assert "f" in rec.target


def test_log_call_sync_error_propagates(caplog):
    @log_call
    def f():
        raise ValueError("x")

    with pytest.raises(ValueError), caplog.at_level(logging.DEBUG):
        f()
    assert any(r.levelno == logging.ERROR and r.exc_info for r in caplog.records)


async def test_log_call_async(caplog):
    @log_call
    async def f():
        return 2

    with caplog.at_level(logging.DEBUG):
        assert await f() == 2
    assert any(r.event == "method_call" for r in caplog.records)


def test_log_errors_skips_private(caplog):
    @log_errors
    class S:
        def __init__(self):
            pass

        def a(self):
            return 1

        def _b(self):
            return 2

    with caplog.at_level(logging.DEBUG):
        s = S()
        s.a()
        s._b()
    targets = [r.target for r in caplog.records if hasattr(r, "target")]
    assert targets == ["test_log_errors_skips_private.<locals>.S.a"]
