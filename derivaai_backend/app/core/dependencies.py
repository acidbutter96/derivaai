"""Cross-domain DI providers only. Domain-specific providers live in each domain's router.py."""
from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


class Pagination:
    def __init__(
        self,
        offset: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
    ):
        self.offset = offset
        self.limit = limit


PaginationDep = Annotated[Pagination, Depends()]
