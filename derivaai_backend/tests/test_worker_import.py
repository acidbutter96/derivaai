import subprocess
import sys


def test_worker_tasks_register_every_table() -> None:
    # The worker never imports the routers; importing tasks alone must still map every FK target.
    code = (
        "import app.workers.tasks\n"
        "from app.db.base import Base\n"
        "tables = {'pipelines', 'lessons', 'renders', 'assets', 'node_types'}\n"
        "assert tables <= set(Base.metadata.tables)\n"
    )
    subprocess.run([sys.executable, "-c", code], check=True)
