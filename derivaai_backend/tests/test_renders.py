import uuid

import pytest

from app.main import app
from app.renders.router import get_render_enqueuer


@pytest.fixture
def enqueued():
    calls: list[uuid.UUID] = []
    app.dependency_overrides[get_render_enqueuer] = lambda: calls.append
    yield calls
    app.dependency_overrides.pop(get_render_enqueuer, None)


async def test_create_render_enqueues_job(client, enqueued):
    pipeline = (await client.post("/pipelines/", json={"name": "rc"})).json()
    r = await client.post("/renders/", json={"pipeline_id": pipeline["id"]})
    assert r.status_code == 202
    assert r.json()["status"] == "queued"
    assert enqueued == [uuid.UUID(r.json()["id"])]


async def test_create_render_unknown_pipeline_returns_404_and_does_not_enqueue(client, enqueued):
    r = await client.post("/renders/", json={"pipeline_id": str(uuid.uuid4())})
    assert r.status_code == 404
    assert enqueued == []


async def test_list_and_get_render(client, enqueued):
    pipeline = (await client.post("/pipelines/", json={"name": "rc"})).json()
    created = (await client.post("/renders/", json={"pipeline_id": pipeline["id"]})).json()
    assert (await client.get(f"/renders/{created['id']}")).status_code == 200
    listed = (await client.get("/renders/", params={"status_filter": "queued"})).json()
    assert [x["id"] for x in listed] == [created["id"]]
