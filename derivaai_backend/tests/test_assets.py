PAYLOAD = {"uri": "storage/rc/plot.png", "kind": "image", "mime_type": "image/png"}


async def test_create_asset(client):
    r = await client.post("/assets/", json=PAYLOAD)
    assert r.status_code == 201
    assert r.json()["size_bytes"] == 0


async def test_duplicate_uri_returns_409(client):
    assert (await client.post("/assets/", json=PAYLOAD)).status_code == 201
    assert (await client.post("/assets/", json=PAYLOAD)).status_code == 409


async def test_update_uri_collision_returns_409_without_mutating_original(client):
    a = (await client.post("/assets/", json=PAYLOAD)).json()
    b = (await client.post("/assets/", json={**PAYLOAD, "uri": "storage/rc/other.png"})).json()
    r = await client.patch(f"/assets/{b['id']}", json={"uri": PAYLOAD["uri"]})
    assert r.status_code == 409
    assert (await client.get(f"/assets/{a['id']}")).json()["uri"] == PAYLOAD["uri"]
