async def test_create_pipeline(client):
    r = await client.post("/pipelines/", json={"name": "rc"})
    assert r.status_code == 201
    assert r.json()["graph"] == {"nodes": [], "edges": []}


async def test_duplicate_name_returns_409(client):
    assert (await client.post("/pipelines/", json={"name": "rc"})).status_code == 201
    assert (await client.post("/pipelines/", json={"name": "rc"})).status_code == 409


async def test_update_collision_returns_409_without_mutating_original(client):
    a = (await client.post("/pipelines/", json={"name": "a"})).json()
    b = (await client.post("/pipelines/", json={"name": "b"})).json()
    r = await client.patch(f"/pipelines/{b['id']}", json={"name": "a"})
    assert r.status_code == 409
    assert (await client.get(f"/pipelines/{a['id']}")).json()["name"] == "a"


async def test_get_missing_returns_404(client):
    r = await client.get("/pipelines/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
