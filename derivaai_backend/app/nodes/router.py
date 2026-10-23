import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import DbSession, PaginationDep
from app.nodes.repository import NodeTypeRepository
from app.nodes.schemas import NodeTypeCreate, NodeTypeRead, NodeTypeUpdate
from app.nodes.service import NodeTypeService


def get_node_type_service(db: DbSession) -> NodeTypeService:
    return NodeTypeService(NodeTypeRepository(db))


NodeTypeServiceDep = Annotated[NodeTypeService, Depends(get_node_type_service)]

router = APIRouter(prefix="/nodes", tags=["nodes"])


@router.post("/", response_model=NodeTypeRead, status_code=status.HTTP_201_CREATED, summary="Register a node type")
async def create_node_type(payload: NodeTypeCreate, service: NodeTypeServiceDep) -> NodeTypeRead:
    return await service.create(payload)


@router.get("/", response_model=list[NodeTypeRead], status_code=status.HTTP_200_OK, summary="List node types")
async def list_node_types(
    service: NodeTypeServiceDep, page: PaginationDep, category: str | None = None
) -> list[NodeTypeRead]:
    return await service.list(page.offset, page.limit, category)


@router.get("/{node_type_id}", response_model=NodeTypeRead, status_code=status.HTTP_200_OK, summary="Get a node type")
async def get_node_type(node_type_id: uuid.UUID, service: NodeTypeServiceDep) -> NodeTypeRead:
    return await service.get(node_type_id)


@router.patch("/{node_type_id}", response_model=NodeTypeRead, status_code=status.HTTP_200_OK, summary="Update a node type")
async def update_node_type(
    node_type_id: uuid.UUID, payload: NodeTypeUpdate, service: NodeTypeServiceDep
) -> NodeTypeRead:
    return await service.update(node_type_id, payload)


@router.delete("/{node_type_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a node type")
async def delete_node_type(node_type_id: uuid.UUID, service: NodeTypeServiceDep) -> None:
    await service.delete(node_type_id)
