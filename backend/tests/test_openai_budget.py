"""Offline concurrency and reset tests for the hard provider budget."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from decimal import Decimal

import pytest

from backend.app.openai_runtime import OpenAIDailyBudget, ProviderBudgetExhausted


def test_concurrent_reservations_cannot_exceed_daily_budget() -> None:
    budget = OpenAIDailyBudget(
        daily_budget_usd=Decimal("0.50"),
        per_call_reservation_usd=Decimal("0.10"),
    )

    def reserve() -> bool:
        try:
            budget.reserve()
        except ProviderBudgetExhausted:
            return False
        return True

    with ThreadPoolExecutor(max_workers=20) as executor:
        outcomes = list(executor.map(lambda _index: reserve(), range(20)))

    assert outcomes.count(True) == 5
    assert outcomes.count(False) == 15
    assert budget.reserved_microdollars == 500_000


def test_failed_reservation_never_reduces_consumed_bound() -> None:
    budget = OpenAIDailyBudget(
        daily_budget_usd=Decimal("1"),
        per_call_reservation_usd=Decimal("1"),
    )
    budget.reserve()

    with pytest.raises(ProviderBudgetExhausted):
        budget.reserve()

    assert budget.reserved_microdollars == 1_000_000


def test_budget_resets_only_when_utc_date_changes() -> None:
    now = [datetime(2026, 7, 20, 23, 59, tzinfo=timezone.utc)]
    budget = OpenAIDailyBudget(
        daily_budget_usd=Decimal("1"),
        per_call_reservation_usd=Decimal("1"),
        utc_now=lambda: now[0],
    )
    budget.reserve()
    with pytest.raises(ProviderBudgetExhausted):
        budget.reserve()

    now[0] = datetime(2026, 7, 21, 0, 0, tzinfo=timezone.utc)
    budget.reserve()
    assert budget.reserved_microdollars == 1_000_000


@pytest.mark.parametrize(
    "daily,reservation",
    [
        ("0", "1"),
        ("NaN", "1"),
        ("Infinity", "1"),
        ("1", "0"),
        ("1", "0.0000001"),
        ("1", "2"),
    ],
)
def test_budget_rejects_invalid_money_configuration(
    daily: str,
    reservation: str,
) -> None:
    with pytest.raises(ValueError):
        OpenAIDailyBudget(
            daily_budget_usd=Decimal(daily),
            per_call_reservation_usd=Decimal(reservation),
        )
