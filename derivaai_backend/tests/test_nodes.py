PAYLOAD = {"key": "sympy.solve", "name": "Solve equation", "category": "math"}


async def test_create_node_type(client):
    r = await client.post("/nodes/", json=PAYLOAD)
    assert r.status_code == 201
    assert r.json()["inputs"] == []


async def test_duplicate_key_returns_409(client):
    assert (await client.post("/nodes/", json=PAYLOAD)).status_code == 201
    assert (await client.post("/nodes/", json=PAYLOAD)).status_code == 409


async def test_update_key_collision_returns_409_without_mutating_original(client):
    a = (await client.post("/nodes/", json=PAYLOAD)).json()
    b = (await client.post("/nodes/", json={**PAYLOAD, "key": "manim.scene", "category": "animation"})).json()
    r = await client.patch(f"/nodes/{b['id']}", json={"key": "sympy.solve"})
    assert r.status_code == 409
    assert (await client.get(f"/nodes/{a['id']}")).json()["key"] == "sympy.solve"


async def test_filter_by_category(client):
    await client.post("/nodes/", json=PAYLOAD)
    await client.post("/nodes/", json={**PAYLOAD, "key": "manim.scene", "category": "animation"})
    r = await client.get("/nodes/", params={"category": "animation"})
    assert [n["key"] for n in r.json()] == ["manim.scene"]
