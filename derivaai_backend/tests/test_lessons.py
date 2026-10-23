async def test_create_lesson(client):
    r = await client.post("/lessons/", json={"slug": "rc", "title": "RC"})
    assert r.status_code == 201
    assert r.json()["language"] == "pt-BR"
    assert r.json()["status"] == "draft"


async def test_duplicate_slug_returns_409(client):
    payload = {"slug": "rc", "title": "RC"}
    assert (await client.post("/lessons/", json=payload)).status_code == 201
    assert (await client.post("/lessons/", json=payload)).status_code == 409


async def test_update_slug_collision_returns_409_without_mutating_original(client):
    a = (await client.post("/lessons/", json={"slug": "a", "title": "A"})).json()
    b = (await client.post("/lessons/", json={"slug": "b", "title": "B"})).json()
    r = await client.patch(f"/lessons/{b['id']}", json={"slug": "a"})
    assert r.status_code == 409
    assert (await client.get(f"/lessons/{a['id']}")).json()["slug"] == "a"
